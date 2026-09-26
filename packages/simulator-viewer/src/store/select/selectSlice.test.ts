import { beforeEach, describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
	ConnectPointPosition,
	ConnectPointType,
	ElementType,
} from '@maklja/vision-simulator-model';
import { createConnectLine, createElement, createStoreWrapper, createTestStore } from '../../test-utils';
import { useRootStore } from '../rootStore';
import { selectElementsInSelection } from './selectSlice';

type Store = ReturnType<typeof createTestStore>;

function loadSelectionGraph(store: Store) {
	store.getState().loadElements([
		createElement(ElementType.Of, { id: 'of-1', x: 0, y: 0 }),
		createElement(ElementType.Map, { id: 'map-1', x: 300, y: 0 }),
	]);
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
				{ x: 258, y: 50 },
			],
		}),
		createConnectLine({
			id: 'cl-2',
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
			points: [
				{ x: 425, y: 50 },
				{ x: 300, y: 50 },
			],
		}),
	]);
}

describe('select slice', () => {
	describe('element selection', () => {
		let store: Store;

		beforeEach(() => {
			store = createTestStore();
			loadSelectionGraph(store);
		});

		it('marks a single element as selected and reveals its connect points', () => {
			store.getState().markElementAsSelected('of-1');

			expect(store.getState().selectedElements).toEqual(['of-1']);
			const rightPoint = store
				.getState()
				.connectPoints['of-1'].find((cp) => cp.position === ConnectPointPosition.Right);
			expect(rightPoint?.visible).toBe(true);
		});

		it('replaces the previous selection when marking another element', () => {
			store.getState().markElementAsSelected('of-1');
			store.getState().markElementAsSelected('map-1');

			expect(store.getState().selectedElements).toEqual(['map-1']);
			expect(store.getState().connectPoints['of-1'].every((cp) => !cp.visible)).toBe(true);
		});

		it('does not reselect an already selected element', () => {
			store.getState().markElementAsSelected('of-1');
			const before = store.getState().connectPoints['of-1'];

			store.getState().markElementAsSelected('of-1');

			expect(store.getState().connectPoints['of-1']).toBe(before);
		});

		it('throws when marking a missing element as selected', () => {
			expect(() => store.getState().markElementAsSelected('missing')).toThrowError(
				'Element with id missing was not found',
			);
		});

		it('toggles elements in and out of the selection', () => {
			store.getState().toggleElementSelection('of-1');
			store.getState().toggleElementSelection('map-1');
			expect(store.getState().selectedElements).toEqual(['of-1', 'map-1']);

			store.getState().toggleElementSelection('of-1');
			expect(store.getState().selectedElements).toEqual(['map-1']);
			expect(store.getState().connectPoints['of-1'].every((cp) => !cp.visible)).toBe(true);
		});
	});

	describe('connect line selection', () => {
		let store: Store;

		beforeEach(() => {
			store = createTestStore();
			loadSelectionGraph(store);
		});

		it('marks a single connect line as selected and replaces the previous one', () => {
			store.getState().markConnectLineAsSelected('cl-1');
			expect(store.getState().selectedConnectLines).toEqual(['cl-1']);

			store.getState().markConnectLineAsSelected('cl-2');
			expect(store.getState().selectedConnectLines).toEqual(['cl-2']);
		});

		it('toggles connect lines in and out of the selection', () => {
			store.getState().toggleConnectLineSelection('cl-1');
			store.getState().toggleConnectLineSelection('cl-2');
			expect(store.getState().selectedConnectLines).toEqual(['cl-1', 'cl-2']);

			store.getState().toggleConnectLineSelection('cl-1');
			expect(store.getState().selectedConnectLines).toEqual(['cl-2']);
		});
	});

	describe('clearing selection', () => {
		let store: Store;

		beforeEach(() => {
			store = createTestStore();
			loadSelectionGraph(store);
		});

		it('clears elements, lines and connect point visibility', () => {
			store.getState().markElementAsSelected('of-1');
			store.getState().markConnectLineAsSelected('cl-1');

			store.getState().clearAllSelectedElements();

			expect(store.getState().selectedElements).toEqual([]);
			expect(store.getState().selectedConnectLines).toEqual([]);
			expect(
				Object.values(store.getState().connectPoints).every((points) =>
					points.every((cp) => !cp.visible),
				),
			).toBe(true);
		});
	});

	describe('removing selected elements', () => {
		it('removes selected elements, their connect points and every incident line', () => {
			const store = createTestStore();
			loadSelectionGraph(store);
			store.getState().markElementAsSelected('of-1');
			store.getState().markConnectLineAsSelected('cl-1');

			store.getState().removeSelectedElements();

			expect(Object.keys(store.getState().elements)).toEqual(['map-1']);
			expect(store.getState().connectPoints['of-1']).toBeUndefined();
			expect(store.getState().connectPoints['map-1']).toHaveLength(4);
			expect(store.getState().connectLines).toEqual({});
		});
	});

	describe('lasso selection', () => {
		let store: Store;

		beforeEach(() => {
			store = createTestStore();
			loadSelectionGraph(store);
		});

		it('selects elements and connect lines intersecting the lasso', () => {
			store.getState().startLassoSelection({ x: -10, y: -10 });
			store.getState().updateLassoSelection({ x: 200, y: 200 });

			store.getState().selectElementsInLassoBoundingBox();

			expect(store.getState().selectedElements).toEqual(['of-1']);
			expect(store.getState().selectedConnectLines).toEqual(['cl-1']);
		});

		it('clears the selection when the lasso misses everything', () => {
			store.getState().markElementAsSelected('of-1');
			store.getState().startLassoSelection({ x: 1000, y: 1000 });
			store.getState().updateLassoSelection({ x: 1100, y: 1100 });

			store.getState().selectElementsInLassoBoundingBox();

			expect(store.getState().selectedElements).toEqual([]);
			expect(store.getState().selectedConnectLines).toEqual([]);
		});

		it('ignores lasso selection without a lasso bounding box', () => {
			store.getState().markElementAsSelected('of-1');

			store.getState().selectElementsInLassoBoundingBox();

			expect(store.getState().selectedElements).toEqual(['of-1']);
		});
	});

	describe('selectElementsInSelection selector', () => {
		it('returns only the selected elements', () => {
			const store = createTestStore();
			loadSelectionGraph(store);
			store.getState().markElementAsSelected('map-1');

			const { result } = renderHook(() => useRootStore(selectElementsInSelection()), {
				wrapper: createStoreWrapper(store),
			});

			expect(result.current.map((el) => el.id)).toEqual(['map-1']);
		});

		it('updates when the selection changes', () => {
			const store = createTestStore();
			loadSelectionGraph(store);

			const { result } = renderHook(() => useRootStore(selectElementsInSelection()), {
				wrapper: createStoreWrapper(store),
			});
			expect(result.current).toEqual([]);

			act(() => {
				store.getState().markElementAsSelected('of-1');
			});

			expect(result.current.map((el) => el.id)).toEqual(['of-1']);
		});
	});
});
