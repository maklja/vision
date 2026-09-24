import { describe, expect, it } from 'vitest';
import { snapPositionToGrind } from './snapPositionToGrid';

describe('snapPositionToGrind', () => {
	it.each([
		[{ x: 20, y: 30 }, 10, { x: 20, y: 30 }],
		[{ x: 24, y: 36 }, 10, { x: 20, y: 40 }],
		[{ x: 25, y: 35 }, 10, { x: 20, y: 30 }],
		[{ x: 29.9, y: 30.1 }, 10, { x: 30, y: 30 }],
		[{ x: 3, y: 7 }, 4, { x: 4, y: 8 }],
	] as const)(
		'snaps positive positions to the nearest grid point',
		(position, size, expected) => {
			expect(snapPositionToGrind(position, size)).toEqual(expected);
		},
	);

	it('preserves the current behavior for negative coordinates', () => {
		expect(snapPositionToGrind({ x: -6, y: -14 }, 10)).toEqual({ x: 0, y: -10 });
	});
});
