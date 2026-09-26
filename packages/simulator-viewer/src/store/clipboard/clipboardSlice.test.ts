import { describe, expect, it } from 'vitest';
import { ConnectPointPosition, ConnectPointType, ElementType } from '@maklja/vision-simulator-model';
import { createConnectLine, createElement, createTestStore } from '../../test-utils';

type Store = ReturnType<typeof createTestStore>;

function createClipboardStore(): Store {
	const store = createTestStore();
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
				{ x: 110, y: 34 },
				{ x: 258, y: 34 },
			],
		}),
	]);
	return store;
}

describe('clipboard slice', () => {
	it('starts with an empty clipboard', () => {
		const store = createTestStore();

		expect(store.getState().clipboard).toEqual({ elements: [], connectLines: [] });
	});

	it('copies selected elements without their connect lines', () => {
		const store = createClipboardStore();
		store.getState().markElementAsSelected('of-1');

		store.getState().copySelected();

		expect(store.getState().clipboard.elements.map((el) => el.id)).toEqual(['of-1']);
		expect(store.getState().clipboard.connectLines).toEqual([]);
	});

	it('copies the endpoint elements of a selected connect line', () => {
		const store = createClipboardStore();
		store.getState().markConnectLineAsSelected('cl-1');

		store.getState().copySelected();

		expect(store.getState().clipboard.elements.map((el) => el.id).sort()).toEqual([
			'map-1',
			'of-1',
		]);
		expect(store.getState().clipboard.connectLines.map((cl) => cl.id)).toEqual(['cl-1']);
	});

	it('ignores pasting with an empty clipboard', () => {
		const store = createClipboardStore();
		const before = store.getState().elements;

		store.getState().pasteSelected({ x: 100, y: 100 });

		expect(store.getState().elements).toBe(before);
	});

	it('pastes copies with remapped ids, offset positions and connect points', () => {
		const store = createClipboardStore();
		store.getState().markConnectLineAsSelected('cl-1');
		store.getState().copySelected();

		store.getState().pasteSelected({ x: 1000, y: 1000 });

		const elements = Object.values(store.getState().elements);
		expect(elements).toHaveLength(4);
		const copied = elements.filter((el) => el.id !== 'of-1' && el.id !== 'map-1');
		expect(copied.map((el) => el.id)).toHaveLength(2);

		const copiedOf = copied.find((el) => el.type === ElementType.Of)!;
		const copiedMap = copied.find((el) => el.type === ElementType.Map)!;
		expect(copiedOf).toMatchObject({ x: 787.5, y: 950 });
		expect(copiedMap).toMatchObject({ x: 1087.5, y: 950 });

		const lines = Object.values(store.getState().connectLines);
		expect(lines).toHaveLength(2);
		const pastedLine = lines.find((cl) => cl.id !== 'cl-1')!;
		expect(pastedLine.source.id).toBe(copiedOf.id);
		expect(pastedLine.target.id).toBe(copiedMap.id);
		expect(pastedLine.points).toEqual([
			{ x: 897.5, y: 984 },
			{ x: 1045.5, y: 984 },
		]);

		expect(store.getState().selectedElements).toEqual([copiedOf.id, copiedMap.id]);
		expect(store.getState().selectedConnectLines).toEqual([pastedLine.id]);
		expect(store.getState().connectPoints[copiedOf.id]).toHaveLength(4);
		expect(store.getState().connectPoints[copiedMap.id]).toHaveLength(4);
	});
});
