import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	ConnectLine,
	ConnectPointPosition,
	ConnectPointType,
	ElementType,
} from '@maklja/vision-simulator-model';
import { createConnectLine, createElement, createTestStore } from '../../test-utils';
import { StageState } from '../stage';
import { selectRelatedElementElements, selectStageDraftConnectLine } from './connectLineSlice';

type Store = ReturnType<typeof createTestStore>;

function loadTwoElements(store: Store) {
	store.getState().loadElements([
		createElement(ElementType.Of, { id: 'of-1' }),
		createElement(ElementType.Map, { id: 'map-1' }),
	]);
}

function startOutputDraft(store: Store, points = [{ x: 0, y: 0 }]) {
	store
		.getState()
		.startConnectLineDraw({
			sourceId: 'of-1',
			type: ConnectPointType.Output,
			position: ConnectPointPosition.Right,
			points,
		});
}

function commitDraft(store: Store) {
	store.getState().addConnectLineDraw({
		connectPointId: 'map-1-left',
		targetId: 'map-1',
		targetPoint: { x: 50, y: 0 },
		targetConnectPointType: ConnectPointType.Input,
		targetConnectPointPosition: ConnectPointPosition.Left,
	});
}

describe('connect line slice', () => {
	it('starts without lines, selection or a draft', () => {
		const store = createTestStore();

		expect(store.getState().connectLines).toEqual({});
		expect(store.getState().selectedConnectLines).toEqual([]);
		expect(store.getState().draftConnectLine).toBeNull();
	});

	describe('draft lines', () => {
		let store: Store;

		beforeEach(() => {
			store = createTestStore();
			loadTwoElements(store);
			startOutputDraft(store);
		});

		it('creates a draft line from the source connect point', () => {
			const draft = store.getState().draftConnectLine!;

			expect(draft).toMatchObject({
				name: 'output_right',
				index: 1,
				locked: false,
				source: {
					id: 'of-1',
					connectPointType: ConnectPointType.Output,
					connectPosition: ConnectPointPosition.Right,
				},
			});
			expect(draft.id).toMatch(/^00000000-0000-4000-8000-\d{12}$/);
		});

		it('moves the draft point freely and normalizes it to the previous point axis', () => {
			store.getState().changeState(StageState.DrawConnectLine);
			store
				.getState()
				.addNextPointToConnectLineDraw({ x: 100, y: 0 });

			store.getState().moveConnectLineDraw({
				position: { x: 42, y: 7 },
				normalizePosition: false,
			});
			expect(store.getState().draftConnectLine!.points.at(-1)).toEqual({ x: 42, y: 7 });

			store.getState().moveConnectLineDraw({
				position: { x: 5, y: 30 },
				normalizePosition: true,
			});
			expect(store.getState().draftConnectLine!.points.at(-1)).toEqual({ x: 0, y: 30 });

			store.getState().moveConnectLineDraw({
				position: { x: 80, y: 5 },
				normalizePosition: true,
			});
			expect(store.getState().draftConnectLine!.points.at(-1)).toEqual({ x: 80, y: 0 });
		});

		it('ignores draft moves outside of the connect line draw stage or once locked', () => {
			store.getState().changeState(StageState.Select);
			const before = store.getState().draftConnectLine!.points;
			store.getState().moveConnectLineDraw({
				position: { x: 9, y: 9 },
				normalizePosition: false,
			});
			expect(store.getState().draftConnectLine!.points).toBe(before);

			store.getState().changeState(StageState.DrawConnectLine);
			store.getState().lockConnectLine({ x: 0, y: 0, width: 0, height: 0 });
			store.getState().moveConnectLineDraw({
				position: { x: 9, y: 9 },
				normalizePosition: false,
			});
			expect(store.getState().draftConnectLine!.points).toEqual(before);
		});

		it('appends points and ignores appends without a draft', () => {
			store.getState().addNextPointToConnectLineDraw({ x: 10, y: 10 });
			store.getState().addNextPointToConnectLineDraw({ x: 20, y: 20 });

			expect(store.getState().draftConnectLine!.points).toEqual([
				{ x: 0, y: 0 },
				{ x: 10, y: 10 },
				{ x: 20, y: 20 },
			]);

			const storeWithoutDraft = createTestStore();
			expect(() =>
				storeWithoutDraft.getState().addNextPointToConnectLineDraw({ x: 1, y: 1 }),
			).not.toThrow();
		});

		it('discards a draft line', () => {
			store.getState().deleteConnectLineDraw();

			expect(store.getState().draftConnectLine).toBeNull();
		});

		it('commits the draft into a connect line and keeps the draft', () => {
			startOutputDraft(store, [
				{ x: 0, y: 0 },
				{ x: 0, y: 25 },
			]);

			commitDraft(store);

			const lines = Object.values(store.getState().connectLines);
			expect(lines).toHaveLength(1);
			expect(lines[0]).toMatchObject({
				name: 'output_right',
				index: 1,
				locked: false,
				points: [
					{ x: 0, y: 0 },
					{ x: 0, y: 25 },
					{ x: 50, y: 0 },
				],
				source: { id: 'of-1', connectPointType: ConnectPointType.Output },
				target: {
					id: 'map-1',
					connectPointType: ConnectPointType.Input,
					connectPosition: ConnectPointPosition.Left,
				},
			});
			expect(store.getState().draftConnectLine).not.toBeNull();
		});

		it('ignores a commit without a draft or a missing target element', () => {
			const storeWithoutDraft = createTestStore();
			loadTwoElements(storeWithoutDraft);
			expect(() => commitDraft(storeWithoutDraft)).not.toThrow();
			expect(storeWithoutDraft.getState().connectLines).toEqual({});

			store.getState().addConnectLineDraw({
				connectPointId: 'missing',
				targetId: 'missing',
				targetPoint: { x: 1, y: 1 },
				targetConnectPointType: ConnectPointType.Input,
				targetConnectPointPosition: ConnectPointPosition.Left,
			});
			expect(store.getState().connectLines).toEqual({});
		});
	});

	describe('naming and indexing', () => {
		it('generates unique names and increasing indexes for the same source and point type', () => {
			const store = createTestStore();
			loadTwoElements(store);

			startOutputDraft(store);
			commitDraft(store);
			startOutputDraft(store);
			commitDraft(store);
			startOutputDraft(store);
			commitDraft(store);

			expect(Object.values(store.getState().connectLines).map((cl) => cl.name)).toEqual([
				'output_right',
				'output_right_1',
				'output_right_1_2',
			]);
			expect(Object.values(store.getState().connectLines).map((cl) => cl.index)).toEqual([
				1, 2, 3,
			]);
		});

		it('scopes names and indexes to the source connect point type', () => {
			const store = createTestStore();
			loadTwoElements(store);

			startOutputDraft(store);
			commitDraft(store);
			store.getState().startConnectLineDraw({
				sourceId: 'of-1',
				type: ConnectPointType.Event,
				position: ConnectPointPosition.Top,
				points: [{ x: 0, y: 0 }],
			});
			commitDraft(store);

			expect(Object.values(store.getState().connectLines).map((cl) => cl.name)).toEqual([
				'output_right',
				'event_top',
			]);
			expect(Object.values(store.getState().connectLines).map((cl) => cl.index)).toEqual([
				1, 1,
			]);
		});
	});

	describe('line mutations', () => {
		let store: Store;
		let lines: ConnectLine[];

		beforeEach(() => {
			store = createTestStore();
			loadTwoElements(store);
			lines = [
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
						{ x: 0, y: 0 },
						{ x: 10, y: 0 },
						{ x: 20, y: 0 },
					],
				}),
				createConnectLine({
					id: 'cl-2',
					source: {
						id: 'of-1',
						connectPointType: ConnectPointType.Event,
						connectPosition: ConnectPointPosition.Top,
					},
					target: {
						id: 'map-1',
						connectPointType: ConnectPointType.Event,
						connectPosition: ConnectPointPosition.Top,
					},
					points: [
						{ x: 0, y: 0 },
						{ x: 0, y: 10 },
					],
				}),
				createConnectLine({
					id: 'cl-3',
					source: {
						id: 'map-1',
						connectPointType: ConnectPointType.Output,
						connectPosition: ConnectPointPosition.Right,
					},
					target: {
						id: 'of-1',
						connectPointType: ConnectPointType.Input,
						connectPosition: ConnectPointPosition.Left,
					},
					points: [{ x: 0, y: 0 }],
				}),
			];
			store.getState().loadConnectLines(lines);
		});

		it('loads lines into a keyed record and replaces the previous record', () => {
			expect(Object.keys(store.getState().connectLines).sort()).toEqual([
				'cl-1',
				'cl-2',
				'cl-3',
			]);

			store.getState().loadConnectLines([createConnectLine({ id: 'only' })]);
			expect(Object.keys(store.getState().connectLines)).toEqual(['only']);
		});

		it('renames and reorders a line while preserving other fields', () => {
			store.getState().updateConnectLine({ id: 'cl-1', name: 'renamed', index: 7 });

			expect(store.getState().connectLines['cl-1']).toMatchObject({
				name: 'renamed',
				index: 7,
				points: lines[0].points,
			});
		});

		it('ignores updates for missing lines', () => {
			const before = store.getState().connectLines;

			store.getState().updateConnectLine({ id: 'missing', name: 'nope' });

			expect(store.getState().connectLines).toBe(before);
		});

		it('adds a line directly', () => {
			store.getState().addConnectLine(createConnectLine({ id: 'cl-4' }));

			expect(store.getState().connectLines['cl-4']).toBeDefined();
		});

		it('removes lines and ignores an empty removal', () => {
			const before = store.getState().connectLines;

			store.getState().removeConnectLines([]);
			expect(store.getState().connectLines).toBe(before);

			store.getState().removeConnectLines(['cl-1', 'cl-2']);
			expect(Object.keys(store.getState().connectLines)).toEqual(['cl-3']);
		});

		it('selects, toggles and clears line selection', () => {
			store.getState().selectConnectLine('cl-1');
			store.getState().selectConnectLine('cl-1');
			store.getState().selectConnectLine('cl-2');
			expect(store.getState().selectedConnectLines).toEqual(['cl-1', 'cl-2']);

			store.getState().deselectConnectLine('cl-1');
			store.getState().deselectConnectLine('missing');
			expect(store.getState().selectedConnectLines).toEqual(['cl-2']);

			store.getState().setSelectConnectLines(['cl-3']);
			expect(store.getState().selectedConnectLines).toEqual(['cl-3']);

			store.getState().deselectAllConnectLines();
			expect(store.getState().selectedConnectLines).toEqual([]);
		});

		it('moves a single point to an absolute position', () => {
			store.getState().movePointConnectLine({
				id: 'cl-1',
				index: 1,
				x: 99,
				y: 88,
				normalizePosition: false,
			});

			expect(store.getState().connectLines['cl-1'].points[1]).toEqual({ x: 99, y: 88 });
		});

		it('normalizes a moved point onto the surrounding points axes', () => {
			const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);

			store.getState().movePointConnectLine({
				id: 'cl-1',
				index: 1,
				x: 22,
				y: 0,
				normalizePosition: true,
			});

			expect(store.getState().connectLines['cl-1'].points[1]).toEqual({ x: 20, y: 0 });
			randomSpy.mockRestore();
		});

		it('ignores point moves for missing lines', () => {
			expect(() =>
				store.getState().movePointConnectLine({
					id: 'missing',
					index: 0,
					x: 1,
					y: 1,
					normalizePosition: false,
				}),
			).not.toThrow();
		});

		it('moves several points by delta and skips out of range indexes', () => {
			store.getState().moveConnectLinePointsByDelta({
				id: 'cl-1',
				pointIndexes: [0, 2, 9, -1],
				dx: 5,
				dy: 6,
			});

			expect(store.getState().connectLines['cl-1'].points).toEqual([
				{ x: 5, y: 6 },
				{ x: 10, y: 0 },
				{ x: 25, y: 6 },
			]);

			const before = store.getState().connectLines['cl-1'].points;
			store.getState().moveConnectLinePointsByDelta({
				id: 'missing',
				pointIndexes: [0],
				dx: 1,
				dy: 1,
			});
			expect(store.getState().connectLines['cl-1'].points).toBe(before);
		});

		it('removes every line incident to an element', () => {
			store.getState().removeElementConnectLines({ elementId: 'of-1' });

			expect(store.getState().connectLines).toEqual({});
		});

		it('removes lines whose either endpoint matches an incident connect point type', () => {
			store.getState().removeElementConnectLines({
				elementId: 'of-1',
				connectPointType: ConnectPointType.Output,
			});

			expect(Object.keys(store.getState().connectLines)).toEqual(['cl-2']);
		});

		it('does not remove lines for an unrelated element', () => {
			store.getState().removeElementConnectLines({ elementId: 'unrelated' });

			expect(Object.keys(store.getState().connectLines)).toHaveLength(3);
		});
	});

	describe('selectors', () => {
		let store: Store;

		beforeEach(() => {
			store = createTestStore();
			loadTwoElements(store);
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
				}),
			]);
		});

		it('exposes the draft connect line', () => {
			expect(selectStageDraftConnectLine()(store.getState())).toBeNull();
			startOutputDraft(store);
			expect(selectStageDraftConnectLine()(store.getState())).toBe(
				store.getState().draftConnectLine,
			);
		});

		it('resolves related elements through outgoing lines', () => {
			const related = selectRelatedElementElements('of-1')(store.getState());

			expect(related).toHaveLength(1);
			expect(related[0].element.id).toBe('map-1');
			expect(related[0].connectLine.id).toBe('cl-1');
		});

		it('returns no related elements for a null element id', () => {
			expect(selectRelatedElementElements(null)(store.getState())).toEqual([]);
		});

		it('throws when a related element is missing', () => {
			store.getState().removeElements(['map-1']);

			expect(() => selectRelatedElementElements('of-1')(store.getState())).toThrowError(
				'Element with id map-1 not found',
			);
		});
	});
});
