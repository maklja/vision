import { beforeEach, describe, expect, it } from 'vitest';
import {
	ConnectPointPosition,
	ConnectPointType,
	ElementType,
	IBoundingBox,
} from '@maklja/vision-simulator-model';
import { createElement, createTestStore } from '../../test-utils';

type Store = ReturnType<typeof createTestStore>;

const byPosition = (store: Store, elementId: string, position: ConnectPointPosition) => {
	const connectPoint = store
		.getState()
		.connectPoints[elementId].find((cp) => cp.position === position);
	expect(connectPoint).toBeDefined();
	return connectPoint!;
};

describe('connect point slice', () => {
	describe('geometry', () => {
		it('derives the four connect points from a creation element geometry', () => {
			const store = createTestStore();
			const element = createElement(ElementType.Of, { id: 'of-1', x: 100, y: 200 });

			store.getState().addElement(element);
			store.getState().createElementConnectPoints(element);

			const connectPoints = store.getState().connectPoints['of-1'];
			expect(connectPoints).toHaveLength(4);
			expect(byPosition(store, 'of-1', ConnectPointPosition.Left)).toMatchObject({
				type: ConnectPointType.Input,
				elementId: 'of-1',
				x: 58,
				y: 234,
				visible: false,
				highlight: false,
			});
			expect(byPosition(store, 'of-1', ConnectPointPosition.Right)).toMatchObject({
				type: ConnectPointType.Output,
				x: 210,
				y: 234,
			});
			expect(byPosition(store, 'of-1', ConnectPointPosition.Top)).toMatchObject({
				type: ConnectPointType.Event,
				x: 134,
				y: 158,
			});
			expect(byPosition(store, 'of-1', ConnectPointPosition.Bottom)).toMatchObject({
				type: ConnectPointType.Event,
				x: 134,
				y: 310,
			});
		});

		it('derives connect points for a rectangle operator', () => {
			const store = createTestStore();
			const element = createElement(ElementType.Map, { id: 'map-1', x: 0, y: 0 });

			store.getState().addElement(element);
			store.getState().createElementConnectPoints(element);

			expect(byPosition(store, 'map-1', ConnectPointPosition.Left)).toMatchObject({
				x: -42,
				y: 34,
			});
			expect(byPosition(store, 'map-1', ConnectPointPosition.Right)).toMatchObject({
				x: 135,
				y: 34,
			});
		});

		it('loads connect points for every element in a graph', () => {
			const store = createTestStore();
			const elements = [
				createElement(ElementType.Of, { id: 'of-1' }),
				createElement(ElementType.Map, { id: 'map-1' }),
			];

			store.getState().loadConnectPoints(elements);

			expect(Object.keys(store.getState().connectPoints).sort()).toEqual(['map-1', 'of-1']);
			expect(store.getState().connectPoints['of-1']).toHaveLength(4);
		});

		it('removes connect points for elements and ignores an empty removal', () => {
			const store = createTestStore();
			store.getState().loadConnectPoints([
				createElement(ElementType.Of, { id: 'of-1' }),
				createElement(ElementType.Map, { id: 'map-1' }),
			]);
			const before = store.getState().connectPoints;

			store.getState().removeElementsConnectPoints([]);
			expect(store.getState().connectPoints).toBe(before);

			store.getState().removeElementsConnectPoints(['of-1']);
			expect(store.getState().connectPoints['of-1']).toBeUndefined();
			expect(store.getState().connectPoints['map-1']).toHaveLength(4);
		});
	});

	describe('visibility and highlighting', () => {
		let store: Store;

		beforeEach(() => {
			store = createTestStore();
			store.getState().loadElements([
				createElement(ElementType.Of, { id: 'of-1' }),
				createElement(ElementType.Map, { id: 'map-1' }),
				createElement(ElementType.Subscriber, { id: 'subscriber-1' }),
			]);
			store.getState().loadConnectPoints(Object.values(store.getState().elements));
		});

		it('reveals input and output but never the events of a creation element', () => {
			store.getState().selectConnectPoints('of-1');

			expect(byPosition(store, 'of-1', ConnectPointPosition.Left).visible).toBe(false);
			expect(byPosition(store, 'of-1', ConnectPointPosition.Right).visible).toBe(true);
			expect(byPosition(store, 'of-1', ConnectPointPosition.Top).visible).toBe(false);
			expect(byPosition(store, 'of-1', ConnectPointPosition.Bottom).visible).toBe(false);
		});

		it('throws when selecting connect points for a missing element', () => {
			expect(() => store.getState().selectConnectPoints('missing')).toThrowError(
				'Element with id missing was not found',
			);
		});

		it('reveals events for an element type that supports them', () => {
			store.getState().addElement(
				createElement(ElementType.From, {
					id: 'from-1',
					properties: { enableObservableEvent: true },
				}),
			);
			store.getState().createElementConnectPoints(store.getState().elements['from-1']);

			store.getState().selectConnectPoints('from-1');

			expect(byPosition(store, 'from-1', ConnectPointPosition.Top).visible).toBe(true);
			expect(byPosition(store, 'from-1', ConnectPointPosition.Bottom).visible).toBe(true);
		});

		it('leaves subscriber connect points hidden because only outputs and events are toggled', () => {
			store.getState().selectConnectPoints('subscriber-1');

			expect(byPosition(store, 'subscriber-1', ConnectPointPosition.Left).visible).toBe(false);
			expect(byPosition(store, 'subscriber-1', ConnectPointPosition.Right).visible).toBe(false);
		});

		it('hides all connect points when clearing the selection', () => {
			store.getState().selectConnectPoints('of-1');
			store.getState().updateConnectPoints({
				connectPointUpdates: [
					{ id: 'of-1', highlight: { [ConnectPointPosition.Right]: true } },
				],
			});

			store.getState().clearSelectedConnectPoints();

			expect(store.getState().connectPoints['of-1'].every((cp) => !cp.visible)).toBe(true);
			expect(byPosition(store, 'of-1', ConnectPointPosition.Right).highlight).toBe(true);
		});

		it('hides the connect points of a single deselected element', () => {
			store.getState().selectConnectPoints('of-1');
			store.getState().deselectConnectPoints('of-1');

			expect(store.getState().connectPoints['of-1'].every((cp) => !cp.visible)).toBe(true);
		});

		it('marks compatible inputs as connectable and hides everything else', () => {
			store.getState().markConnectionPointsAsConnectable(['map-1']);

			expect(byPosition(store, 'map-1', ConnectPointPosition.Left)).toMatchObject({
				type: ConnectPointType.Input,
				visible: true,
			});
			expect(byPosition(store, 'map-1', ConnectPointPosition.Right).visible).toBe(false);
			expect(store.getState().connectPoints['of-1'].every((cp) => !cp.visible)).toBe(true);
		});

		it('applies highlight per position and visibility per type', () => {
			store.getState().updateConnectPoints({
				connectPointUpdates: [
					{
						id: 'of-1',
						visibility: { [ConnectPointType.Output]: true },
						highlight: { [ConnectPointPosition.Right]: true },
					},
				],
			});

			expect(byPosition(store, 'of-1', ConnectPointPosition.Right)).toMatchObject({
				visible: true,
				highlight: true,
			});
			expect(byPosition(store, 'of-1', ConnectPointPosition.Left)).toMatchObject({
				visible: false,
				highlight: false,
			});
		});

		it('throws when updating connect points that were never created', () => {
			expect(() =>
				store.getState().updateConnectPoints({
					connectPointUpdates: [{ id: 'missing', visibility: { input: true } }],
				}),
			).toThrowError('Failed to find connect points for element missing');
		});

		it('clears highlights only', () => {
			store.getState().selectConnectPoints('of-1');
			store.getState().updateConnectPoints({
				connectPointUpdates: [
					{ id: 'of-1', highlight: { [ConnectPointPosition.Right]: true } },
				],
			});

			store.getState().clearHighlightConnectPoints();

			expect(store.getState().connectPoints['of-1'].every((cp) => !cp.highlight)).toBe(true);
			expect(byPosition(store, 'of-1', ConnectPointPosition.Right).visible).toBe(true);
		});

		it('sets visibility for the selected elements and hides the rest', () => {
			store.getState().setSelectElementsConnectPoints(['map-1']);

			expect(byPosition(store, 'map-1', ConnectPointPosition.Right).visible).toBe(true);
			expect(store.getState().connectPoints['of-1'].every((cp) => !cp.visible)).toBe(true);
		});

		it('marks only the chosen element as the selected connect point owner', () => {
			store.getState().setSelectElementConnectPoint('map-1');

			expect(byPosition(store, 'map-1', ConnectPointPosition.Right).visible).toBe(true);
			expect(store.getState().connectPoints['of-1'].every((cp) => !cp.visible)).toBe(true);
		});

		it('throws when the selected connect point owner is missing', () => {
			expect(() => store.getState().setSelectElementConnectPoint('missing')).toThrowError(
				'Element with id missing was not found',
			);
		});
	});

	describe('movement', () => {
		let store: Store;

		beforeEach(() => {
			store = createTestStore();
			store.getState().loadConnectPoints([createElement(ElementType.Of, { id: 'of-1', x: 0, y: 0 })]);
		});

		it('moves connect points by delta', () => {
			const before = byPosition(store, 'of-1', ConnectPointPosition.Right);

			store.getState().moveConnectPointsByDelta({ ids: ['of-1'], dx: 15, dy: -5 });

			expect(byPosition(store, 'of-1', ConnectPointPosition.Right)).toMatchObject({
				x: before.x + 15,
				y: before.y - 5,
			});
		});

		it('throws when moving connect points of a missing element', () => {
			expect(() =>
				store.getState().moveConnectPointsByDelta({ ids: ['missing'], dx: 1, dy: 1 }),
			).toThrowError('Connect points not found for element missing');
		});
	});

	describe('draft connect line locking', () => {
		let store: Store;

		beforeEach(() => {
			store = createTestStore();
			store.getState().addElement(createElement(ElementType.Of, { id: 'of-1' }));
			store.getState().startConnectLineDraw({
				sourceId: 'of-1',
				type: ConnectPointType.Output,
				position: ConnectPointPosition.Right,
				points: [
					{ x: 0, y: 0 },
					{ x: 5, y: 5 },
				],
			});
		});

		it('locks the draft line to the center of an overlapping bounding box', () => {
			const boundingBox: IBoundingBox = { x: 0, y: 0, width: 10, height: 20 };

			store.getState().lockConnectLine(boundingBox);

			const draft = store.getState().draftConnectLine!;
			expect(draft.locked).toBe(true);
			expect(draft.points.at(-1)).toEqual({ x: 5, y: 10 });
		});

		it('does not lock when the bounding box does not overlap the last point', () => {
			const boundingBox: IBoundingBox = { x: 100, y: 100, width: 10, height: 10 };
			const before = store.getState().draftConnectLine!.points;

			store.getState().lockConnectLine(boundingBox);

			expect(store.getState().draftConnectLine!.locked).toBe(false);
			expect(store.getState().draftConnectLine!.points).toEqual(before);
		});

		it('ignores locking without a draft connect line', () => {
			const storeWithoutDraft = createTestStore();

			expect(() =>
				storeWithoutDraft
					.getState()
					.lockConnectLine({ x: 0, y: 0, width: 10, height: 10 }),
			).not.toThrow();
			expect(storeWithoutDraft.getState().draftConnectLine).toBeNull();
		});

		it('unlocks a locked draft connect line', () => {
			store.getState().lockConnectLine({ x: 0, y: 0, width: 10, height: 10 });
			store.getState().unlockDraftConnectLine();

			expect(store.getState().draftConnectLine!.locked).toBe(false);
		});

		it('ignores unlock without a draft connect line', () => {
			const storeWithoutDraft = createTestStore();

			expect(() => storeWithoutDraft.getState().unlockDraftConnectLine()).not.toThrow();
		});
	});
});
