import { expect, Page } from '@playwright/test';
import {
	ConnectLine,
	ConnectPointPosition,
	Element,
	ElementType,
	Point,
} from '@maklja/vision-simulator-model';
import { PersistedCanvasState, PersistedDiagram, findElementById } from './diagram';
import {
	clearPersistedDiagram,
	readPersistedDiagram,
	seedPersistedDiagram,
	waitForDiagram,
} from './indexedDb';
import {
	getConnectLineClickPoint,
	getConnectPointCenter,
	getElementBounds,
	getElementCenter,
	worldToBrowser,
} from './geometry';

const STAGE_TEST_ID = 'simulator-stage';
/** Element drags snap to nearby elements within this distance (see store snapLines). */
const SNAP_TOLERANCE = 6;

export interface ConnectOperatorsOptions {
	sourcePosition?: ConnectPointPosition;
	targetPosition?: ConnectPointPosition;
	/** World-space polyline waypoints clicked between the source and target connect points. */
	waypoints?: Point[];
}

/** Opens the application and waits for the Konva stage to render. */
export async function bootstrapEditor(page: Page): Promise<void> {
	await page.goto('/');
	await expect(page.getByTestId(STAGE_TEST_ID)).toBeVisible();

	const existing = await readPersistedDiagram(page);
	if (existing) {
		await clearPersistedDiagram(page);
		await page.reload();
		await expect(page.getByTestId(STAGE_TEST_ID)).toBeVisible();
	}
}

/**
 * Opens the application on a persisted fixture. The first load gives the viewer an origin to seed
 * IndexedDB from, and the reload then loads the diagram exactly like a returning user's session.
 */
export async function bootstrapEditorWithDiagram(
	page: Page,
	diagram: PersistedDiagram,
): Promise<void> {
	await page.goto('/');
	await expect(page.getByTestId(STAGE_TEST_ID)).toBeVisible();

	await seedPersistedDiagram(page, diagram);
	await page.reload();
	await expect(page.getByTestId(STAGE_TEST_ID)).toBeVisible();
}

async function getStageOrigin(page: Page): Promise<Point> {
	const box = await page.getByTestId(STAGE_TEST_ID).boundingBox();
	if (!box) {
		throw new Error('Simulator stage is not visible');
	}

	return { x: box.x, y: box.y };
}

async function readCanvasState(page: Page): Promise<PersistedCanvasState> {
	const diagram = await readPersistedDiagram(page);
	return diagram?.canvasState ?? { x: 0, y: 0, scaleX: 1, scaleY: 1 };
}

async function toBrowserPoint(page: Page, point: Point): Promise<Point> {
	const [stageOrigin, canvasState] = await Promise.all([
		getStageOrigin(page),
		readCanvasState(page),
	]);
	return worldToBrowser(point, canvasState, stageOrigin);
}

/**
 * Drags an operator from the palette onto the stage and returns the element that was
 * persisted for it. The new element is located by diffing ids, so callers never depend on
 * generated UUID values or operator-type uniqueness.
 */
export async function addOperator(
	page: Page,
	groupName: string,
	operatorType: ElementType,
	position: Point,
): Promise<Element> {
	const before = await readPersistedDiagram(page);
	const existingIds = new Set((before?.elements ?? []).map((element) => element.id));

	// The group button toggles its popper, so only click it when the operator is not already
	// listed. Otherwise a second add from the same group would close the open popper.
	const operatorButton = page.getByTestId(`operator-${operatorType}`);
	if (!(await operatorButton.isVisible())) {
		await page.getByRole('button', { name: groupName, exact: true }).click();
	}

	await operatorButton.dragTo(page.getByTestId(STAGE_TEST_ID), { targetPosition: position });

	const diagram = await waitForDiagram(
		page,
		(current) => (current?.elements.length ?? 0) > existingIds.size,
	);
	const created = diagram.elements.find((element) => !existingIds.has(element.id));
	if (!created) {
		throw new Error(`Dragging "${operatorType}" did not create a persisted element`);
	}

	return created;
}

/** Selects an element by clicking its rendered center. */
export async function selectElement(page: Page, element: Element): Promise<void> {
	const center = await toBrowserPoint(page, getElementCenter(element));
	await page.mouse.click(center.x, center.y);
}

/**
 * Control-clicks an element so the editor adds it to the current selection instead of replacing
 * it, mirroring the Control-modified multi-selection used elsewhere in the editor.
 */
export async function ctrlClickElement(page: Page, element: Element): Promise<void> {
	const center = await toBrowserPoint(page, getElementCenter(element));
	await page.keyboard.down('Control');
	await page.mouse.click(center.x, center.y);
	await page.keyboard.up('Control');
}

/** Drags an element so its top-left corner lands on the requested world position. */
export async function dragElementTo(page: Page, element: Element, target: Point): Promise<Element> {
	const bounds = getElementBounds(element);
	const start = await toBrowserPoint(page, getElementCenter(element));
	const targetCenter = await toBrowserPoint(page, {
		x: target.x + bounds.width / 2,
		y: target.y + bounds.height / 2,
	});

	await page.mouse.move(start.x, start.y);
	await page.mouse.down();
	await page.mouse.move(targetCenter.x, targetCenter.y, { steps: 10 });
	await page.mouse.up();

	const diagram = await waitForDiagram(page, (current) => {
		const moved = findElementById(current, element.id);
		return (
			!!moved &&
			Math.abs(moved.x - target.x) <= SNAP_TOLERANCE &&
			Math.abs(moved.y - target.y) <= SNAP_TOLERANCE
		);
	});

	return findElementById(diagram, element.id) as Element;
}

/**
 * Shift-drags an element while Konva's drag bound snaps to the theme grid. The element ends
 * up on the nearest grid multiple rather than at the raw drop point, so the helper waits for
 * the snapped target instead of the requested one.
 */
export async function shiftDragElementTo(
	page: Page,
	element: Element,
	target: Point,
	gridSize: number,
): Promise<Element> {
	const bounds = getElementBounds(element);
	const start = await toBrowserPoint(page, getElementCenter(element));
	const targetCenter = await toBrowserPoint(page, {
		x: target.x + bounds.width / 2,
		y: target.y + bounds.height / 2,
	});

	await page.keyboard.down('Shift');
	await page.mouse.move(start.x, start.y);
	await page.mouse.down();
	await page.mouse.move(targetCenter.x, targetCenter.y, { steps: 10 });
	await page.mouse.up();
	await page.keyboard.up('Shift');

	const snappedTarget = {
		x: Math.round(target.x / gridSize) * gridSize,
		y: Math.round(target.y / gridSize) * gridSize,
	};

	const diagram = await waitForDiagram(page, (current) => {
		const moved = findElementById(current, element.id);
		return (
			!!moved &&
			Math.abs(moved.x - snappedTarget.x) <= 1 &&
			Math.abs(moved.y - snappedTarget.y) <= 1
		);
	});

	return findElementById(diagram, element.id) as Element;
}

/** Resolves the browser viewport point of an element's rendered center. */
export async function getElementBrowserCenter(page: Page, element: Element): Promise<Point> {
	return toBrowserPoint(page, getElementCenter(element));
}

/** Pans the stage with a middle-button drag between two browser viewport points. */
export async function panStage(page: Page, start: Point, end: Point): Promise<void> {
	await page.mouse.move(start.x, start.y);
	await page.mouse.down({ button: 'middle' });
	await page.mouse.move(end.x, end.y, { steps: 10 });
	await page.mouse.up({ button: 'middle' });
}

/** Zooms the stage in one step through the rendered zoom controls. */
export async function zoomIn(page: Page): Promise<void> {
	await page.getByRole('button', { name: 'zoom in' }).click();
}

/**
 * Opens the Entry operator autocomplete and activates the nested locate control of the given
 * entry element, which resets the scale and re-centers the stage on the element's shape center.
 */
export async function locateEntryOperator(page: Page, element: Element): Promise<void> {
	await page.getByLabel('Entry operator').click();
	const option = page.getByRole('option', { name: `${element.type} - ${element.name}` });
	await option.getByRole('button').click();
}

/** Ctrl-drag lasso selection between two world points. */
export async function lassoSelect(page: Page, start: Point, end: Point): Promise<void> {
	const [startBrowser, endBrowser] = await Promise.all([
		toBrowserPoint(page, start),
		toBrowserPoint(page, end),
	]);

	await page.keyboard.down('Control');
	await page.mouse.move(startBrowser.x, startBrowser.y);
	await page.mouse.down();
	await page.mouse.move(endBrowser.x, endBrowser.y, { steps: 10 });
	await page.mouse.up();
	await page.keyboard.up('Control');
}

/**
 * Selects a connect line by clicking a point on its wire. Pass the diagram elements so the
 * click target is chosen clear of element bounding boxes.
 */
export async function selectConnectLine(
	page: Page,
	connectLine: ConnectLine,
	elements: Element[] = [],
): Promise<void> {
	const clickPoint = getConnectLineClickPoint(connectLine.points, elements.map(getElementBounds));
	const browserPoint = await toBrowserPoint(page, clickPoint);
	await page.mouse.click(browserPoint.x, browserPoint.y);
}

/** Draws a connection from a source connect point to a target connect point. */
export async function connectOperators(
	page: Page,
	source: Element,
	target: Element,
	options: ConnectOperatorsOptions = {},
): Promise<ConnectLine> {
	const sourcePosition = options.sourcePosition ?? ConnectPointPosition.Right;
	const targetPosition = options.targetPosition ?? ConnectPointPosition.Left;

	const before = await readPersistedDiagram(page);
	const existingCount = before?.connectLines.length ?? 0;

	await selectElement(page, source);

	const [stageOrigin, canvasState] = await Promise.all([
		getStageOrigin(page),
		readCanvasState(page),
	]);
	const sourceOutput = worldToBrowser(
		getConnectPointCenter(source, sourcePosition),
		canvasState,
		stageOrigin,
	);
	const targetInput = worldToBrowser(
		getConnectPointCenter(target, targetPosition),
		canvasState,
		stageOrigin,
	);

	await page.mouse.move(sourceOutput.x, sourceOutput.y);
	await page.mouse.down();

	// Each waypoint click pins a polyline segment before the line is linked to its target.
	for (const waypoint of options.waypoints ?? []) {
		const waypointPoint = worldToBrowser(waypoint, canvasState, stageOrigin);
		await page.mouse.move(waypointPoint.x, waypointPoint.y, { steps: 10 });
		await page.mouse.down();
		await page.mouse.up();
	}

	await page.mouse.move(targetInput.x, targetInput.y, { steps: 10 });
	await page.mouse.up();

	const diagram = await waitForDiagram(
		page,
		(current) => (current?.connectLines.length ?? 0) > existingCount,
	);

	return diagram.connectLines[diagram.connectLines.length - 1];
}

export async function selectEntryOperator(page: Page, element: Element): Promise<void> {
	await page.getByLabel('Entry operator').click();
	await page.getByRole('option', { name: `${element.type} - ${element.name}` }).click();
}

export async function startSimulation(page: Page): Promise<void> {
	await page.getByRole('button', { name: 'start simulation' }).click();
}

export function simulationResults(page: Page) {
	return page.getByLabel('simulation results');
}

/**
 * Scopes the "Observable inputs order" section rendered by join creation property forms.
 */
function observableInputsOrderSection(page: Page) {
	return page
		.getByText('Observable inputs order', { exact: true })
		.locator('xpath=ancestor::div[contains(@class,"MuiStack-root")][1]');
}

/**
 * Reads the target element type of every ordered observable input row. The rows are the
 * event connect lines of the selected join creation element, and each one is named after
 * the element it feeds.
 */
export async function observableInputTargets(page: Page): Promise<string[]> {
	const nameFields = observableInputsOrderSection(page).locator('input[readonly]');
	return nameFields.evaluateAll((inputs) =>
		inputs.map((input) => (input as HTMLInputElement).value),
	);
}

/**
 * Sets the ordering index of the observable input that targets the given element type.
 * The row is located by its target name instead of its position, so editing never depends
 * on the order the rows happen to be rendered in.
 */
export async function setObservableInputIndex(
	page: Page,
	targetType: string,
	index: number,
): Promise<void> {
	const section = observableInputsOrderSection(page);
	const nameFields = section.locator('input[readonly]');
	const targets = await nameFields.evaluateAll((inputs) =>
		inputs.map((input) => (input as HTMLInputElement).value),
	);

	const rowIndex = targets.indexOf(targetType);
	if (rowIndex === -1) {
		throw new Error(`No observable input targets "${targetType}"`);
	}

	const row = nameFields
		.nth(rowIndex)
		.locator('xpath=ancestor::div[contains(@class,"MuiStack-root")][1]');
	await row.getByLabel('Index', { exact: true }).fill(`${index}`);
}

/** Copies the current selection with the application's Control+C shortcut. */
export async function copySelection(page: Page): Promise<void> {
	await page.keyboard.press('Control+c');
}

/**
 * Moves the pointer to a world position and pastes with Control+V. The application reads the
 * paste origin from the pointer, so the pointer move is part of the interaction.
 */
export async function pasteSelectionAt(page: Page, position: Point): Promise<void> {
	const browserPoint = await toBrowserPoint(page, position);
	await page.mouse.move(browserPoint.x, browserPoint.y);
	await page.keyboard.press('Control+v');
}

/** Deletes the current selection with the Delete key. */
export async function deleteSelection(page: Page): Promise<void> {
	await page.keyboard.press('Delete');
}
