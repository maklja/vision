import { expect, Page, test } from '@playwright/test';
import { Element, ElementType, Point } from '@maklja/vision-simulator-model';
import {
	addOperator,
	bootstrapEditor,
	connectOperators,
	copySelection,
	ctrlClickElement,
	deleteSelection,
	dragElementTo,
	lassoSelect,
	pasteSelectionAt,
	selectConnectLine,
} from './support/editor';
import { findElementById, PersistedDiagram, requireConnectLineById } from './support/diagram';
import { getElementBounds } from './support/geometry';
import { readPersistedDiagram, waitForDiagramCounts } from './support/indexedDb';

/**
 * Two floating panels sit above the stage: the operator palette popper stays open after an
 * operator is dragged out of it (roughly x 80..380, y 284..576) and the properties panel renders
 * on the right (x 870..1270) whenever a single element is selected. Pointer gestures that must
 * reach the stage are therefore kept below the popper and left of the properties panel.
 */
const PALETTE_POPPER_BOTTOM_EDGE = 580;
const PROPERTIES_PANEL_LEFT_EDGE = 870;

/** A lasso rectangle is drawn from one corner to the opposite one, so only the extremes matter. */
function lassoAround(elements: Element[], margin: number): { start: Point; end: Point } {
	const bounds = elements.map(getElementBounds);
	return {
		start: {
			x: Math.min(...bounds.map((box) => box.x)) - margin,
			y: Math.min(...bounds.map((box) => box.y)) - margin,
		},
		end: {
			x: Math.max(...bounds.map((box) => box.x + box.width)) + margin,
			y: Math.max(...bounds.map((box) => box.y + box.height)) + margin,
		},
	};
}

function requireElement(diagram: PersistedDiagram, id: string): Element {
	const element = findElementById(diagram, id);
	if (!element) {
		throw new Error(`No persisted element with id "${id}"`);
	}

	return element;
}

function sortIds(ids: string[]): string[] {
	return [...ids].sort((left, right) => left.localeCompare(right));
}

/**
 * A multi-selection is not persisted, so it is observed through the properties panel: only a
 * single selected element renders the "Element details" window.
 */
async function expectNoElementDetails(page: Page): Promise<void> {
	await expect(page.getByText(/Element details:/)).toHaveCount(0);
}

test.use({ viewport: { width: 1280, height: 900 } });

test('copies, pastes and edits a grouped graph through the rendered editor', async ({ page }) => {
	await bootstrapEditor(page);

	// Build and connect `of -> map` through the palette and canvas. The extra waypoint gives the
	// wire an internal segment point that the grouped editing assertions can follow.
	const ofElement = await addOperator(page, 'creation operators', ElementType.Of, {
		x: 480,
		y: 250,
	});
	await waitForDiagramCounts(page, 1, 0);
	const mapElement = await addOperator(page, 'transformation operators', ElementType.Map, {
		x: 700,
		y: 250,
	});
	await waitForDiagramCounts(page, 2, 0);
	const builtLine = await connectOperators(page, ofElement, mapElement, {
		waypoints: [{ x: 600, y: 330 }],
	});
	const original = await waitForDiagramCounts(page, 2, 1);
	const originalOf = requireElement(original, ofElement.id);
	const originalMap = requireElement(original, mapElement.id);
	const originalLine = requireConnectLineById(original, builtLine.id);
	const originalIds = [originalOf.id, originalMap.id];

	// A Control-modified lasso selects both elements and their connecting line.
	const lasso = lassoAround([originalOf, originalMap], 30);
	await lassoSelect(page, lasso.start, lasso.end);

	// A multi-selection never resolves to a single element, so no properties panel is exposed.
	await expectNoElementDetails(page);

	// Copy the selection and paste it at a known empty canvas position.
	await copySelection(page);
	await pasteSelectionAt(page, { x: 546.25, y: 690 });
	const pasted = await waitForDiagramCounts(page, 4, 2);

	// Two elements and one line were added, and no pasted record reuses an original id.
	const pastedElements = pasted.elements.filter((element) => !originalIds.includes(element.id));
	expect(pastedElements).toHaveLength(2);
	const pastedLine = pasted.connectLines.find((line) => line.id !== originalLine.id);
	if (!pastedLine) {
		throw new Error('Pasting the group did not add a connect line');
	}

	// Pasted element names stay unique across the whole diagram.
	const allNames = pasted.elements.map((element) => element.name);
	expect(new Set(allNames).size).toBe(allNames.length);

	const pastedOf = pastedElements.find((element) => element.type === ElementType.Of);
	const pastedMap = pastedElements.find((element) => element.type === ElementType.Map);
	if (!pastedOf || !pastedMap) {
		throw new Error('Pasted group is missing an of or map element');
	}
	expect(pastedOf.name).not.toBe(originalOf.name);
	expect(pastedMap.name).not.toBe(originalMap.name);

	// The pasted line is owned by the pasted endpoints, not by the originals.
	expect(pastedLine.source.id).toBe(pastedOf.id);
	expect(pastedLine.target.id).toBe(pastedMap.id);

	// Every pasted element and line point moved by the same group delta.
	const pasteDelta = { x: pastedOf.x - originalOf.x, y: pastedOf.y - originalOf.y };
	expect(pasteDelta.x).not.toBe(0);
	expect(pasteDelta.y).not.toBe(0);
	expect(pastedMap.x - originalMap.x).toBeCloseTo(pasteDelta.x, 6);
	expect(pastedMap.y - originalMap.y).toBeCloseTo(pasteDelta.y, 6);
	expect(pastedLine.points).toHaveLength(originalLine.points.length);
	pastedLine.points.forEach((point, index) => {
		expect(point.x - originalLine.points[index].x).toBeCloseTo(pasteDelta.x, 6);
		expect(point.y - originalLine.points[index].y).toBeCloseTo(pasteDelta.y, 6);
	});

	// Drag one pasted element while the pasted graph is still selected: the whole group moves.
	const movedOf = await dragElementTo(page, pastedOf, { x: pastedOf.x - 60, y: pastedOf.y + 60 });
	const afterGroupDrag = await readPersistedDiagram(page);
	if (!afterGroupDrag) {
		throw new Error('Persisted diagram disappeared after the grouped drag');
	}

	const dragDelta = { x: movedOf.x - pastedOf.x, y: movedOf.y - pastedOf.y };
	expect(dragDelta.x).not.toBe(0);
	expect(dragDelta.y).not.toBe(0);

	const movedMap = requireElement(afterGroupDrag, pastedMap.id);
	expect(movedMap.x - pastedMap.x).toBeCloseTo(dragDelta.x, 6);
	expect(movedMap.y - pastedMap.y).toBeCloseTo(dragDelta.y, 6);

	const movedLine = requireConnectLineById(afterGroupDrag, pastedLine.id);
	expect(movedLine.points).toHaveLength(pastedLine.points.length);
	// Points 0/1 are the source endpoint and the last two are the target endpoint; the waypoint in
	// between is an internal segment point carried along by the selected line.
	const internalPointIndexes = movedLine.points.map((_, index) => index).slice(2, -2);
	expect(internalPointIndexes).toHaveLength(1);
	internalPointIndexes.forEach((index) => {
		expect(movedLine.points[index].x - pastedLine.points[index].x).toBeCloseTo(dragDelta.x, 6);
		expect(movedLine.points[index].y - pastedLine.points[index].y).toBeCloseTo(dragDelta.y, 6);
	});
	movedLine.points.forEach((point, index) => {
		expect(point.x - pastedLine.points[index].x).toBeCloseTo(dragDelta.x, 6);
		expect(point.y - pastedLine.points[index].y).toBeCloseTo(dragDelta.y, 6);
	});

	// The original graph stays exactly where it was.
	const originalOfAfterDrag = requireElement(afterGroupDrag, originalOf.id);
	expect({ x: originalOfAfterDrag.x, y: originalOfAfterDrag.y }).toEqual({
		x: originalOf.x,
		y: originalOf.y,
	});
	const originalMapAfterDrag = requireElement(afterGroupDrag, originalMap.id);
	expect({ x: originalMapAfterDrag.x, y: originalMapAfterDrag.y }).toEqual({
		x: originalMap.x,
		y: originalMap.y,
	});
	expect(requireConnectLineById(afterGroupDrag, originalLine.id).points).toEqual(
		originalLine.points,
	);

	// Select the pasted line and delete it: both pasted elements survive without the wire.
	await selectConnectLine(page, movedLine, afterGroupDrag.elements);
	await deleteSelection(page);
	const afterLineDelete = await waitForDiagramCounts(page, 4, 1);
	expect(sortIds(afterLineDelete.elements.map((element) => element.id))).toEqual(
		sortIds([...originalIds, pastedOf.id, pastedMap.id]),
	);
	expect(afterLineDelete.connectLines.map((line) => line.id)).toEqual([originalLine.id]);

	// Draw a replacement connection between the two pasted elements.
	const replacementLine = await connectOperators(page, movedOf, movedMap);
	const afterReconnect = await waitForDiagramCounts(page, 4, 2);
	expect(replacementLine.id).not.toBe(pastedLine.id);
	expect(replacementLine.id).not.toBe(originalLine.id);
	const persistedReplacement = requireConnectLineById(afterReconnect, replacementLine.id);
	expect(persistedReplacement.source.id).toBe(movedOf.id);
	expect(persistedReplacement.target.id).toBe(movedMap.id);
	expect(persistedReplacement.points.length).toBeGreaterThan(1);

	// Lasso the pasted group again and delete it; only the original graph survives.
	const pastedOfNow = requireElement(afterReconnect, pastedOf.id);
	const pastedMapNow = requireElement(afterReconnect, pastedMap.id);
	const groupLasso = lassoAround([pastedOfNow, pastedMapNow], 30);
	expect(groupLasso.start.y).toBeGreaterThan(PALETTE_POPPER_BOTTOM_EDGE);
	expect(groupLasso.end.x).toBeLessThan(PROPERTIES_PANEL_LEFT_EDGE);
	await lassoSelect(page, groupLasso.start, groupLasso.end);
	await deleteSelection(page);
	const afterGroupDelete = await waitForDiagramCounts(page, 2, 1);
	expect(sortIds(afterGroupDelete.elements.map((element) => element.id))).toEqual(
		sortIds(originalIds),
	);
	expect(afterGroupDelete.connectLines.map((line) => line.id)).toEqual([originalLine.id]);

	// A stale selection is neither persisted nor rendered in the DOM, and it is only observable
	// while it survives: a later Delete would run removeSelectedElements() and clear it. Both
	// selection kinds are therefore checked here, straight after the group deletion.

	// Connect lines: Control+C replaces the clipboard, and with an empty selection the copy stores
	// nothing, so the following paste adds nothing. A deleted replacement line that outlived the
	// group deletion would make the copy throw on the missing line, keep the earlier group in the
	// clipboard, and the paste would then duplicate and select the original graph again.
	await copySelection(page);
	await pasteSelectionAt(page, { x: 546.25, y: 690 });

	// Adding an operator is the positive post-shortcut synchronization point for that assertion: its
	// write lands after the shortcuts, so a duplicated graph cannot hide behind a snapshot the
	// predicate had already matched.
	const addedOperator = await addOperator(page, 'creation operators', ElementType.Of, {
		x: 700,
		y: 700,
	});
	const afterPasteShortcuts = await waitForDiagramCounts(page, 3, 1);
	expect(sortIds(afterPasteShortcuts.elements.map((element) => element.id))).toEqual(
		sortIds([...originalIds, addedOperator.id]),
	);
	expect(afterPasteShortcuts.connectLines.map((line) => line.id)).toEqual([originalLine.id]);

	// Elements: a Control-click adds to the selection instead of replacing it, which makes the
	// properties panel an observable for leftover selected ids: it renders only while exactly one
	// element is selected. An id that survived the group deletion would keep the panel hidden here,
	// whereas a plain click would replace the selection and hide the evidence.
	const survivingOf = requireElement(afterPasteShortcuts, originalOf.id);
	await ctrlClickElement(page, survivingOf);
	await expect(page.getByText(`Element details: ${survivingOf.name}`)).toBeVisible();
	await expect(page.getByLabel('Id', { exact: true })).toHaveValue(survivingOf.id);

	// Adding the second surviving element hides the panel again, which is the outcome the check
	// above would have observed if the deleted ids had outlived the group deletion.
	await ctrlClickElement(page, requireElement(afterPasteShortcuts, originalMap.id));
	await expectNoElementDetails(page);
});
