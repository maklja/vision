import { expect, Page, test } from '@playwright/test';
import { ElementType } from '@maklja/vision-simulator-model';
import {
	addOperator,
	bootstrapEditor,
	connectOperators,
	getElementBrowserCenter,
	locateEntryOperator,
	panStage,
	selectElement,
	shiftDragElementTo,
	zoomIn,
} from './support/editor';
import { getElementCenter, worldToBrowser } from './support/geometry';
import { findElementById, requireConnectLineById } from './support/diagram';
import { readPersistedDiagram, waitForDiagram, waitForDiagramCounts } from './support/indexedDb';

const STAGE_TEST_ID = 'simulator-stage';
/** The viewer theme places element drags on a 25-unit grid (see gridTheme). */
const GRID_SIZE = 25;

// These journeys run tall enough to reach all palette groups without scrolling. The palette's
// short-viewport behavior is covered separately at the end.
test.use({ viewport: { width: 1280, height: 900 } });

/** Sorts persisted records by id so reload comparisons ignore unrelated ordering. */
function sortById<T extends { id: string }>(records: T[]): T[] {
	return [...records].sort((left, right) => left.id.localeCompare(right.id));
}

/** The Element explorer accordion starts collapsed; expand it to reach the id and name fields. */
async function expandElementExplorer(page: Page): Promise<void> {
	const summary = page.getByRole('button', { name: 'Element explorer' });
	if ((await summary.getAttribute('aria-expanded')) === 'false') {
		await summary.click();
	}
}

test('keeps operator configuration and the viewport through a real reload', async ({ page }) => {
	await bootstrapEditor(page);

	// Build and connect range -> subscriber through the rendered editor.
	const range = await addOperator(page, 'creation operators', ElementType.Range, {
		x: 480,
		y: 250,
	});
	await waitForDiagramCounts(page, 1, 0);
	const subscriber = await addOperator(page, 'subscriber', ElementType.Subscriber, {
		x: 700,
		y: 300,
	});
	const built = await waitForDiagramCounts(page, 2, 0);
	expect(findElementById(built, range.id)).toBeTruthy();
	expect(findElementById(built, subscriber.id)).toBeTruthy();

	const connectLine = await connectOperators(page, range, subscriber);
	await waitForDiagramCounts(page, 2, 1);

	// Rename range and change its properties through the rendered controls.
	const renamedRange = 'range-restored';
	await selectElement(page, range);
	await expandElementExplorer(page);
	await page.getByLabel('Name', { exact: true }).fill(renamedRange);
	await page.getByLabel('Start', { exact: true }).fill('5');
	await page.getByLabel('Count', { exact: true }).fill('3');

	// Pan the stage with a middle-button drag, then change scale through the zoom controls.
	const stageBox = await page.getByTestId(STAGE_TEST_ID).boundingBox();
	if (!stageBox) {
		throw new Error('Simulator stage is not visible');
	}
	await panStage(
		page,
		{ x: stageBox.x + 700, y: stageBox.y + 480 },
		{ x: stageBox.x + 820, y: stageBox.y + 660 },
	);
	await zoomIn(page);

	// Poll IndexedDB until the edited name, properties, and non-default viewport are all stored.
	const saved = await waitForDiagram(page, (diagram) => {
		if (!diagram) {
			return false;
		}
		const element = findElementById(diagram, range.id);
		const properties = element?.properties as { start?: number; count?: number } | undefined;
		const { canvasState } = diagram;
		return (
			element?.name === renamedRange &&
			properties?.start === 5 &&
			properties?.count === 3 &&
			canvasState.x !== 0 &&
			canvasState.y !== 0 &&
			canvasState.scaleX !== 1
		);
	});
	expect(saved.connectLines.map((line) => line.id)).toEqual([connectLine.id]);
	expect(saved.canvasState.scaleX).toBeCloseTo(saved.canvasState.scaleY, 5);

	// Reload within the same browser context and let the store rehydrate from IndexedDB.
	await page.reload();
	await expect(page.getByTestId(STAGE_TEST_ID)).toBeVisible();
	const restored = await waitForDiagram(
		page,
		(diagram) => (diagram?.elements.length ?? 0) === 2 && diagram?.connectLines.length === 1,
	);

	// The reloaded snapshot matches what was saved: graph, name, properties, and viewport.
	expect(sortById(restored.elements)).toEqual(sortById(saved.elements));
	expect(sortById(restored.connectLines)).toEqual(sortById(saved.connectLines));
	expect(restored.themeId).toBe(saved.themeId);
	expect(restored.canvasState.x).toBeCloseTo(saved.canvasState.x, 5);
	expect(restored.canvasState.y).toBeCloseTo(saved.canvasState.y, 5);
	expect(restored.canvasState.scaleX).toBeCloseTo(saved.canvasState.scaleX, 5);
	expect(restored.canvasState.scaleY).toBeCloseTo(saved.canvasState.scaleY, 5);
	expect(restored.canvasState.scaleX).not.toBe(1);

	// The restored transform maps world coordinates to a clickable browser point.
	const restoredRange = findElementById(restored, range.id);
	if (!restoredRange) {
		throw new Error('Range element was not restored');
	}
	await selectElement(page, restoredRange);
	await expect(page.getByLabel('Id', { exact: true })).toHaveValue(range.id);
	await expect(page.getByLabel('Name', { exact: true })).toHaveValue(renamedRange);
	await expect(page.getByLabel('Start', { exact: true })).toHaveValue('5');
	await expect(page.getByLabel('Count', { exact: true })).toHaveValue('3');
});

test('snaps a dragged entry element to the grid and locates it in the viewport', async ({
	page,
}) => {
	await bootstrapEditor(page);

	// Keep the entry element far from the subscriber so magnetic element snap lines stay silent.
	const range = await addOperator(page, 'creation operators', ElementType.Range, {
		x: 480,
		y: 200,
	});
	await waitForDiagramCounts(page, 1, 0);
	const subscriber = await addOperator(page, 'subscriber', ElementType.Subscriber, {
		x: 700,
		y: 130,
	});
	await waitForDiagramCounts(page, 2, 0);
	const connectLine = await connectOperators(page, range, subscriber);
	const initial = await waitForDiagramCounts(page, 2, 1);

	// Shift-drag range to a deliberately non-grid-aligned world point.
	const moved = await shiftDragElementTo(page, range, { x: 333, y: 187 }, GRID_SIZE);

	// The persisted world coordinates sit on the current grid.
	expect(moved.x % GRID_SIZE).toBe(0);
	expect(moved.y % GRID_SIZE).toBe(0);
	expect(moved.x).toBe(325);
	expect(moved.y).toBe(175);

	// The attached connect-line endpoint moves by the same delta as the element.
	const movedDiagram = await readPersistedDiagram(page);
	if (!movedDiagram) {
		throw new Error('Persisted diagram disappeared after the drag');
	}
	const movedLine = requireConnectLineById(movedDiagram, connectLine.id);
	const beforeLine = requireConnectLineById(initial, connectLine.id);
	const deltaX = moved.x - range.x;
	const deltaY = moved.y - range.y;
	expect(movedLine.points[0].x - beforeLine.points[0].x).toBeCloseTo(deltaX, 1);
	expect(movedLine.points[0].y - beforeLine.points[0].y).toBeCloseTo(deltaY, 1);

	// Remember where the entry element was rendered before the viewport changed.
	const originalScreenCenter = await getElementBrowserCenter(page, moved);

	// The subscriber is the current selection so the locate assertion can prove it is replaced.
	await selectElement(page, subscriber);
	await expect(page.getByLabel('Id', { exact: true })).toHaveValue(subscriber.id);

	// Pan and zoom until the entry element is displaced from its original screen position.
	const stageBox = await page.getByTestId(STAGE_TEST_ID).boundingBox();
	if (!stageBox) {
		throw new Error('Simulator stage is not visible');
	}
	await panStage(
		page,
		{ x: stageBox.x + 620, y: stageBox.y + 480 },
		{ x: stageBox.x + 840, y: stageBox.y + 660 },
	);
	await zoomIn(page);
	await waitForDiagram(
		page,
		(diagram) => !!diagram && diagram.canvasState.scaleX !== 1 && diagram.canvasState.x !== 0,
	);
	const displacedScreenCenter = await getElementBrowserCenter(page, moved);
	expect(
		Math.hypot(
			displacedScreenCenter.x - originalScreenCenter.x,
			displacedScreenCenter.y - originalScreenCenter.y,
		),
	).toBeGreaterThan(50);

	// Locate the entry element through the nested control in the Entry operator options.
	await locateEntryOperator(page, moved);
	const located = await waitForDiagram(
		page,
		(diagram) =>
			!!diagram && diagram.canvasState.scaleX === 1 && diagram.canvasState.scaleY === 1,
	);

	// Scale resets to 1 and the viewport centers the element's actual shape center.
	const centered = worldToBrowser(getElementCenter(moved), located.canvasState, {
		x: stageBox.x,
		y: stageBox.y,
	});
	expect(centered.x).toBeCloseTo(stageBox.x + stageBox.width / 2, 0);
	expect(centered.y).toBeCloseTo(stageBox.y + stageBox.height / 2, 0);

	// The previous selection is cleared and the located element becomes the sole selection.
	await expect(page.getByLabel('Id', { exact: true })).toHaveValue(moved.id);
	await expect(page.getByText(`Element details: ${moved.name}`)).toBeVisible();
});

test.describe('operator palette layout', () => {
	test.use({ viewport: { width: 1280, height: 720 } });

	test('keeps the palette and zoom controls operable at the default viewport', async ({ page }) => {
		await bootstrapEditor(page);
		await addOperator(page, 'creation operators', ElementType.Range, { x: 480, y: 250 });
		await addOperator(page, 'subscriber', ElementType.Subscriber, { x: 700, y: 250 });

		await zoomIn(page);
		const diagram = await waitForDiagram(
			page,
			(current) => !!current && current.canvasState.scaleX !== 1,
		);
		expect(diagram.canvasState.scaleX).toBeGreaterThan(1);
	});
});
