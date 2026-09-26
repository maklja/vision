import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import {
	ConnectPointPosition,
	ConnectPointType,
	ElementType,
	SnapLineOrientation,
} from '@maklja/vision-simulator-model';
import {
	createConnectLine,
	createElement,
	createStoreWrapper,
	createTestStore,
	enableFakeTimers,
} from '../../test-utils';
import { retrieveThemeColor } from '../../theme';
import { useRootStore } from '../rootStore';
import { SimulationState } from '../simulation';
import {
	isElementDragAllowed,
	isHighlighted,
	isStageStateDragging,
	selectCanvasState,
	selectElementTooltip,
	selectIsDraggable,
	selectLasso,
	selectStageState,
	StageState,
} from './stageSlice';

type Store = ReturnType<typeof createTestStore>;

function loadTwoElements(store: Store) {
	store.getState().loadElements([
		createElement(ElementType.Of, { id: 'of-1', x: 0, y: 0 }),
		createElement(ElementType.Map, { id: 'map-1', x: 300, y: 0 }),
	]);
}

describe('stage slice', () => {
	describe('state', () => {
		it('starts in select with a default canvas and theme', () => {
			const store = createTestStore();

			expect(store.getState().state).toBe(StageState.Select);
			expect(selectStageState()(store.getState())).toBe(StageState.Select);
			expect(store.getState().lassoSelection).toBeNull();
			expect(store.getState().tooltip).toBeNull();
			expect(store.getState().highlighted).toEqual([]);
			expect(selectCanvasState(store.getState())).toMatchObject({
				x: 0,
				y: 0,
				scaleX: 1,
				scaleY: 1,
				autoDragInterval: null,
				snapToGrip: false,
			});
			expect(store.getState().theme.default.colors.id).toBe('sea');
		});

		it('changes the stage state', () => {
			const store = createTestStore();

			store.getState().changeState(StageState.Dragging);

			expect(store.getState().state).toBe(StageState.Dragging);
		});

		it('reports drag eligibility per stage state and simulation state', () => {
			const store = createTestStore();

			expect(isStageStateDragging(StageState.Dragging)).toBe(true);
			expect(isStageStateDragging(StageState.Select)).toBe(false);
			expect(isElementDragAllowed(StageState.Select)).toBe(true);
			expect(isElementDragAllowed(StageState.Dragging)).toBe(true);
			expect(isElementDragAllowed(StageState.LassoSelect)).toBe(false);

			expect(selectIsDraggable(store.getState())).toBe(true);

			store.getState().startSimulation();
			expect(selectIsDraggable(store.getState())).toBe(false);
			expect(store.getState().simulation.state).toBe(SimulationState.Running);

			store.getState().resetSimulation();
			expect(selectIsDraggable(store.getState())).toBe(true);
		});
	});

	describe('lasso selection', () => {
		let store: Store;

		beforeEach(() => {
			store = createTestStore();
		});

		it('ignores a null start point', () => {
			store.getState().startLassoSelection(null);

			expect(store.getState().state).toBe(StageState.Select);
			expect(store.getState().lassoSelection).toBeNull();
		});

		it('starts, updates and stops a lasso selection', () => {
			store.getState().startLassoSelection({ x: 10, y: 20 });
			expect(store.getState()).toMatchObject({
				state: StageState.LassoSelect,
				lassoSelection: { x: 10, y: 20, width: 0, height: 0 },
			});

			store.getState().updateLassoSelection({ x: 40, y: 60 });
			expect(store.getState().lassoSelection).toEqual({
				x: 10,
				y: 20,
				width: 30,
				height: 40,
			});

			store.getState().stopLassoSelection();
			expect(store.getState().lassoSelection).toBeNull();
			expect(store.getState().state).toBe(StageState.Select);
		});

		it('ignores updates without a point or lasso', () => {
			store.getState().updateLassoSelection({ x: 1, y: 1 });
			expect(store.getState().lassoSelection).toBeNull();

			store.getState().startLassoSelection({ x: 5, y: 5 });
			const before = store.getState().lassoSelection;

			store.getState().updateLassoSelection(null);
			expect(store.getState().lassoSelection).toBe(before);
		});

		it('exposes normalized lasso bounds through the selector', () => {
			store.getState().startLassoSelection({ x: 100, y: 80 });
			store.getState().updateLassoSelection({ x: 20, y: 10 });

			const { result } = renderHook(() => useRootStore(selectLasso()), {
				wrapper: createStoreWrapper(store),
			});

			expect(result.current).toEqual({ x: 20, y: 10, width: 80, height: 70 });
		});

		it('returns a null lasso through the selector when there is no lasso', () => {
			const { result } = renderHook(() => useRootStore(selectLasso()), {
				wrapper: createStoreWrapper(store),
			});

			expect(result.current).toBeNull();
		});
	});

	describe('canvas state', () => {
		it('merges canvas updates', () => {
			const store = createTestStore();

			store.getState().updateCanvasState({ x: 10, y: 20, scaleX: 2 });
			store.getState().updateCanvasState({ y: 30, snapToGrip: true });

			expect(store.getState().canvasState).toMatchObject({
				x: 10,
				y: 30,
				scaleX: 2,
				snapToGrip: true,
			});
		});

		it('clears a running auto drag interval', () => {
			const restoreTimers = enableFakeTimers();
			const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');
			const store = createTestStore();
			store.getState().updateCanvasState({ autoDragInterval: 42 });

			store.getState().clearCanvasAutoDragInterval();

			expect(clearIntervalSpy).toHaveBeenCalledWith(42);
			expect(store.getState().canvasState.autoDragInterval).toBeNull();

			clearIntervalSpy.mockRestore();
			restoreTimers();
		});

		it('ignores clearing without a running auto drag interval', () => {
			const store = createTestStore();

			store.getState().clearCanvasAutoDragInterval();

			expect(store.getState().canvasState.autoDragInterval).toBeNull();
		});
	});

	describe('theme and highlighting', () => {
		it('changes the theme by id and falls back to the default', () => {
			const store = createTestStore();

			store.getState().changeTheme('beige');
			expect(store.getState().theme.default.colors).toEqual(retrieveThemeColor('beige'));

			store.getState().changeTheme('unknown');
			expect(store.getState().theme.default.colors).toEqual(retrieveThemeColor());

			store.getState().changeTheme();
			expect(store.getState().theme.default.colors.id).toBe('sea');
		});

		it('sets and reads the highlighted element ids', () => {
			const store = createTestStore();

			store.getState().setHighlighted(['of-1', 'map-1']);

			expect(store.getState().highlighted).toEqual(['of-1', 'map-1']);
			expect(isHighlighted('of-1')(store.getState())).toBe(true);
			expect(isHighlighted('missing')(store.getState())).toBe(false);
		});
	});

	describe('tooltip', () => {
		let store: Store;

		beforeEach(() => {
			store = createTestStore();
			loadTwoElements(store);
		});

		it('shows a tooltip with explicit text and hides it', () => {
			store.getState().showTooltip({ elementId: 'of-1', text: 'hello' });
			expect(store.getState().tooltip).toEqual({ elementId: 'of-1', text: 'hello' });

			store.getState().hideTooltip();
			expect(store.getState().tooltip).toBeNull();
		});

		it('shows a tooltip without text as null text and ignores hiding an empty tooltip', () => {
			store.getState().showTooltip({ elementId: 'of-1' });
			expect(store.getState().tooltip).toEqual({ elementId: 'of-1', text: null });

			store.getState().hideTooltip();
			expect(() => store.getState().hideTooltip()).not.toThrow();
			expect(store.getState().tooltip).toBeNull();
		});

		it('calculates the tooltip position from element geometry', () => {
			store.getState().showTooltip({ elementId: 'of-1', text: 'hello' });

			const { result } = renderHook(() => useRootStore(selectElementTooltip()), {
				wrapper: createStoreWrapper(store),
			});

			expect(result.current).toEqual({
				id: 'of-1',
				text: 'hello',
				x: 50,
				y: 0,
				width: 100,
			});
		});

		it('falls back to the element name and then to the element error message', () => {
			store.getState().showTooltip({ elementId: 'of-1' });
			const { result, rerender } = renderHook(() => useRootStore(selectElementTooltip()), {
				wrapper: createStoreWrapper(store),
			});
			expect(result.current?.text).toBe('of-1');

			act(() => {
				store.getState().createElementError({
					elementId: 'of-1',
					errorId: 'error-1',
					errorMessage: 'boom',
				});
			});
			rerender();
			expect(result.current?.text).toBe('boom');
		});

		it('returns null for a missing tooltip element', () => {
			store.getState().showTooltip({ elementId: 'missing', text: 'hello' });

			const { result } = renderHook(() => useRootStore(selectElementTooltip()), {
				wrapper: createStoreWrapper(store),
			});

			expect(result.current).toBeNull();
		});
	});

	describe('loading a graph', () => {
		it('loads elements, connect points and connect lines', () => {
			const store = createTestStore();

			store.getState().load(
				[createElement(ElementType.Of, { id: 'of-1' })],
				[createConnectLine({ id: 'cl-1' })],
			);

			expect(Object.keys(store.getState().elements)).toEqual(['of-1']);
			expect(store.getState().connectPoints['of-1']).toHaveLength(4);
			expect(Object.keys(store.getState().connectLines)).toEqual(['cl-1']);
		});
	});

	describe('element drawing', () => {
		let store: Store;

		beforeEach(() => {
			store = createTestStore();
		});

		it('starts and stops an element draft', () => {
			store.getState().startElementDraw({ type: ElementType.Of, x: 10, y: 20 });
			expect(store.getState().state).toBe(StageState.DrawElement);
			expect(store.getState().draftElement).toMatchObject({
				type: ElementType.Of,
				name: 'of_0',
				x: 10,
				y: 20,
			});

			store.getState().stopElementDraw();
			expect(store.getState().state).toBe(StageState.Select);
			expect(store.getState().draftElement).toBeNull();
		});

		it('commits a draft element and creates its connect points', () => {
			store.getState().startElementDraw({ type: ElementType.Of, x: 10, y: 20 });
			const draftId = store.getState().draftElement!.id;

			store.getState().addDraftElement();

			expect(store.getState().state).toBe(StageState.Select);
			expect(store.getState().draftElement).toBeNull();
			expect(store.getState().elements[draftId]).toMatchObject({ type: ElementType.Of });
			expect(store.getState().connectPoints[draftId]).toHaveLength(4);
		});

		it('ignores committing without a draft', () => {
			store.getState().addDraftElement();

			expect(store.getState().state).toBe(StageState.Select);
			expect(store.getState().elements).toEqual({});
		});
	});

	describe('connect line drawing', () => {
		let store: Store;

		beforeEach(() => {
			store = createTestStore();
			loadTwoElements(store);
			store.getState().loadConnectPoints(Object.values(store.getState().elements));
		});

		it('starts a connect line draw and marks compatible inputs', () => {
			store.getState().startConnectLineDraw({
				sourceId: 'of-1',
				type: ConnectPointType.Output,
				position: ConnectPointPosition.Right,
				points: [{ x: 0, y: 0 }],
			});

			expect(store.getState().state).toBe(StageState.DrawConnectLine);
			expect(store.getState().draftConnectLine).not.toBeNull();
			expect(store.getState().selectedElements).toContain('map-1');
			const mapInput = store
				.getState()
				.connectPoints['map-1'].find((cp) => cp.position === ConnectPointPosition.Left);
			expect(mapInput?.visible).toBe(true);
		});

		it('does nothing when the connect line source element is missing', () => {
			store.getState().startConnectLineDraw({
				sourceId: 'missing',
				type: ConnectPointType.Output,
				position: ConnectPointPosition.Right,
				points: [{ x: 0, y: 0 }],
			});

			expect(store.getState().state).toBe(StageState.Select);
			expect(store.getState().draftConnectLine).toBeNull();
		});

		it('stops a connect point draw and reselects the source element', () => {
			store.getState().startConnectLineDraw({
				sourceId: 'of-1',
				type: ConnectPointType.Output,
				position: ConnectPointPosition.Right,
				points: [{ x: 0, y: 0 }],
			});

			store.getState().stopConnectPointDraw();

			expect(store.getState().state).toBe(StageState.Select);
			expect(store.getState().draftConnectLine).toBeNull();
			expect(store.getState().selectedElements).toEqual(['of-1']);
		});

		it('stops a connect point draw without a draft', () => {
			store.getState().stopConnectPointDraw();

			expect(store.getState().state).toBe(StageState.Select);
			expect(store.getState().selectedElements).toEqual([]);
		});

		it('links the draft into a connect line and reselects the source', () => {
			store.getState().startConnectLineDraw({
				sourceId: 'of-1',
				type: ConnectPointType.Output,
				position: ConnectPointPosition.Right,
				points: [
					{ x: 0, y: 0 },
					{ x: 10, y: 10 },
				],
			});

			store.getState().linkConnectLineDraw({
				connectPointId: 'map-1-left',
				targetId: 'map-1',
				targetPoint: { x: 20, y: 20 },
				targetConnectPointType: ConnectPointType.Input,
				targetConnectPointPosition: ConnectPointPosition.Left,
			});

			expect(store.getState().state).toBe(StageState.Select);
			expect(store.getState().draftConnectLine).toBeNull();
			const line = Object.values(store.getState().connectLines)[0];
			expect(line).toMatchObject({
				source: { id: 'of-1' },
				target: { id: 'map-1' },
				points: [
					{ x: 0, y: 0 },
					{ x: 10, y: 10 },
					{ x: 20, y: 20 },
				],
			});
			expect(store.getState().selectedElements).toEqual(['of-1']);
		});

		it('ignores linking without a draft connect line', () => {
			store.getState().linkConnectLineDraw({
				connectPointId: 'map-1-left',
				targetId: 'map-1',
				targetPoint: { x: 20, y: 20 },
				targetConnectPointType: ConnectPointType.Input,
				targetConnectPointPosition: ConnectPointPosition.Left,
			});

			expect(store.getState().connectLines).toEqual({});
		});
	});

	describe('moving elements', () => {
		let store: Store;

		beforeEach(() => {
			store = createTestStore();
			loadTwoElements(store);
			store.getState().loadConnectPoints(Object.values(store.getState().elements));
			store.getState().loadConnectLines([
				createConnectLine({
					id: 'cl-1',
					source: {
						id: 'of-1',
						connectPointType: ConnectPointType.Output,
						connectPosition: ConnectPointPosition.Right,
					},
					target: {
						id: 'map-1',
						connectPointType: ConnectPointType.Input,
						connectPosition: ConnectPointPosition.Left,
					},
					points: [
						{ x: 110, y: 50 },
						{ x: 180, y: 50 },
						{ x: 258, y: 50 },
					],
				}),
			]);
		});

		it('moves a single element, its connect points and line endpoints to a position', () => {
			store.getState().moveElement({ id: 'of-1', x: 100, y: 0 });

			expect(store.getState().elements['of-1']).toMatchObject({ x: 100, y: 0 });
			const sourcePoint = store
				.getState()
				.connectPoints['of-1'].find((cp) => cp.position === ConnectPointPosition.Right);
			expect(sourcePoint).toMatchObject({ x: 210, y: 34 });
			expect(store.getState().connectLines['cl-1'].points).toEqual([
				{ x: 210, y: 50 },
				{ x: 280, y: 50 },
				{ x: 258, y: 50 },
			]);
		});

		it('ignores moving a missing element', () => {
			const before = store.getState().elements;

			store.getState().moveElement({ id: 'missing', x: 1, y: 1 });

			expect(store.getState().elements).toBe(before);
		});

		it('moves the selected elements, their connect points and line points by delta', () => {
			store.getState().setSelectElements(['of-1']);
			store.getState().startLassoSelection({ x: 0, y: 0 });

			store.getState().moveSelectedElementsByDelta({
				referenceElementId: 'of-1',
				x: 10,
				y: 0,
			});

			expect(store.getState().elements['of-1']).toMatchObject({ x: 10, y: 0 });
			expect(store.getState().elements['map-1']).toMatchObject({ x: 300, y: 0 });
			const sourcePoint = store
				.getState()
				.connectPoints['of-1'].find((cp) => cp.position === ConnectPointPosition.Right);
			expect(sourcePoint).toMatchObject({ x: 120, y: 34 });
			expect(store.getState().connectLines['cl-1'].points).toEqual([
				{ x: 120, y: 50 },
				{ x: 190, y: 50 },
				{ x: 258, y: 50 },
			]);
		});

		it('ignores moving selected elements without any selection or reference', () => {
			store.getState().moveSelectedElementsByDelta({
				referenceElementId: 'of-1',
				x: 10,
				y: 0,
			});
			expect(store.getState().elements['of-1']).toMatchObject({ x: 0, y: 0 });

			store.getState().setSelectElements(['of-1']);
			store.getState().moveSelectedElementsByDelta({
				referenceElementId: 'missing',
				x: 10,
				y: 0,
			});
			expect(store.getState().elements['of-1']).toMatchObject({ x: 0, y: 0 });
		});
	});

	describe('snap lines', () => {
		let store: Store;

		beforeEach(() => {
			store = createTestStore();
			store.getState().loadElements([
				createElement(ElementType.Of, { id: 'of-1', x: 0, y: 0 }),
				createElement(ElementType.Of, { id: 'of-2', x: 0, y: 0 }),
			]);
		});

		it('creates element snap lines and stores them', () => {
			const snapLines = store.getState().createElementSnapLines({
				elementId: 'of-1',
				x: 0,
				y: 0,
			});

			expect(snapLines.length).toBeGreaterThan(0);
			expect(store.getState().snapLines).toBe(snapLines);
			expect(snapLines.every((line) => Math.abs(line.distance) < 6)).toBe(true);
		});

		it('excludes the selected elements from element snap lines', () => {
			store.getState().setSelectElements(['of-2']);

			const snapLines = store.getState().createElementSnapLines({
				elementId: 'of-1',
				x: 0,
				y: 0,
			});

			expect(snapLines).toEqual([]);
		});

		it('returns no element snap lines for a missing element', () => {
			expect(
				store.getState().createElementSnapLines({ elementId: 'missing', x: 0, y: 0 }),
			).toEqual([]);
		});

		it('creates snap lines for a draft element', () => {
			store.getState().startElementDraw({ type: ElementType.Of, x: 0, y: 0 });

			const snapLines = store.getState().createDraftElementSnapLines({ x: 0, y: 0 });

			expect(snapLines.length).toBeGreaterThan(0);
			expect(store.getState().snapLines).toBe(snapLines);
		});

		it('returns no snap lines without a draft element', () => {
			expect(store.getState().createDraftElementSnapLines({ x: 0, y: 0 })).toEqual([]);
		});

		it('creates connect point snap lines for a draft connect line', () => {
			store.getState().loadConnectPoints(Object.values(store.getState().elements));
			store.getState().startConnectLineDraw({
				sourceId: 'of-1',
				type: ConnectPointType.Output,
				position: ConnectPointPosition.Right,
				points: [{ x: 0, y: 0 }],
			});
			store.getState().selectConnectPoints('of-2');
			const targetPoint = store
				.getState()
				.connectPoints['of-2'].find((cp) => cp.position === ConnectPointPosition.Right)!;

			const snapLines = store.getState().createConnectPointSnapLines({
				x: targetPoint.x + 16,
				y: targetPoint.y + 16,
			});

			expect(snapLines.length).toBeGreaterThan(0);
			expect(store.getState().snapLines).toBe(snapLines);
			expect(
				snapLines.some(
					(line) =>
						line.orientation === SnapLineOrientation.Horizontal ||
						line.orientation === SnapLineOrientation.Vertical,
				),
			).toBe(true);
		});

		it('returns no connect point snap lines without a draft or source connect points', () => {
			expect(store.getState().createConnectPointSnapLines({ x: 0, y: 0 })).toEqual([]);

			store.getState().startConnectLineDraw({
				sourceId: 'of-1',
				type: ConnectPointType.Output,
				position: ConnectPointPosition.Right,
				points: [{ x: 0, y: 0 }],
			});
			expect(store.getState().createConnectPointSnapLines({ x: 0, y: 0 })).toEqual([]);
		});
	});

	describe('pinning connect lines', () => {
		it('locks the draft connect line and schedules a snap animation', () => {
			const store = createTestStore();
			loadTwoElements(store);
			store.getState().startConnectLineDraw({
				sourceId: 'of-1',
				type: ConnectPointType.Output,
				position: ConnectPointPosition.Right,
				points: [
					{ x: 0, y: 0 },
					{ x: 5, y: 5 },
				],
			});

			store.getState().pinConnectLine({
				elementId: 'map-1',
				connectPointId: 'map-1-left',
				connectPointBoundingBox: { x: 0, y: 0, width: 10, height: 10 },
			});

			expect(store.getState().draftConnectLine!.locked).toBe(true);
			expect(store.getState().animations['map-1-left'][0].key).toBe('snapConnectPointAnimation');
		});

		it('ignores pinning without a draft connect line', () => {
			const store = createTestStore();

			store.getState().pinConnectLine({
				elementId: 'map-1',
				connectPointId: 'map-1-left',
				connectPointBoundingBox: { x: 0, y: 0, width: 10, height: 10 },
			});

			expect(store.getState().animations).toEqual({});
		});

		it('unpins the draft connect line and disposes the snap animation', () => {
			const store = createTestStore();
			loadTwoElements(store);
			store.getState().startConnectLineDraw({
				sourceId: 'of-1',
				type: ConnectPointType.Output,
				position: ConnectPointPosition.Right,
				points: [
					{ x: 0, y: 0 },
					{ x: 5, y: 5 },
				],
			});
			store.getState().pinConnectLine({
				elementId: 'map-1',
				connectPointId: 'map-1-left',
				connectPointBoundingBox: { x: 0, y: 0, width: 10, height: 10 },
			});
			const animationId = store.getState().animations['map-1-left'][0].id;

			store.getState().unpinConnectLine({
				drawerId: 'map-1-left',
				animationId,
			});

			expect(store.getState().draftConnectLine!.locked).toBe(false);
			expect(store.getState().animations['map-1-left'][0].dispose).toBe(true);
		});

		it('unpins without an animation id', () => {
			const store = createTestStore();
			loadTwoElements(store);
			store.getState().startConnectLineDraw({
				sourceId: 'of-1',
				type: ConnectPointType.Output,
				position: ConnectPointPosition.Right,
				points: [{ x: 0, y: 0 }],
			});
			store.getState().lockConnectLine({ x: 0, y: 0, width: 0, height: 0 });

			store.getState().unpinConnectLine({ drawerId: 'map-1-left', animationId: null });

			expect(store.getState().draftConnectLine!.locked).toBe(false);
		});
	});
});
