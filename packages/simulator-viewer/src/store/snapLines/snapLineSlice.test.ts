import { describe, expect, it } from 'vitest';
import { SnapLine, SnapLineOrientation } from '@maklja/vision-simulator-model';
import { createTestStore } from '../../test-utils';
import { selectSnapLines } from './snapLineSlice';

function snapLine(id: string): SnapLine {
	return {
		points: [
			{ x: 0, y: Number(id) },
			{ x: 100, y: Number(id) },
		],
		distance: Number(id),
		length: 100,
		orientation: SnapLineOrientation.Horizontal,
	};
}

describe('snap line slice', () => {
	it('starts with no snap lines', () => {
		const store = createTestStore();

		expect(store.getState().snapLines).toEqual([]);
		expect(selectSnapLines(store.getState())).toEqual([]);
	});

	it('sets and replaces snap lines', () => {
		const store = createTestStore();

		store.getState().setSnapLines([snapLine('1'), snapLine('2')]);
		expect(store.getState().snapLines).toHaveLength(2);

		store.getState().setSnapLines([snapLine('3')]);
		expect(store.getState().snapLines).toHaveLength(1);
		expect(selectSnapLines(store.getState())[0].distance).toBe(3);
	});

	it('clears snap lines and keeps the same array when already empty', () => {
		const store = createTestStore();
		const before = store.getState().snapLines;

		store.getState().clearSnapLines();
		expect(store.getState().snapLines).toBe(before);

		store.getState().setSnapLines([snapLine('1')]);
		store.getState().clearSnapLines();
		expect(store.getState().snapLines).toEqual([]);
	});
});
