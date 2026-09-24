import { describe, expect, it } from 'vitest';
import { lineToPolygon } from './lineToPolygon';

describe('lineToPolygon', () => {
	it('creates a polygon around a horizontal line', () => {
		expect(lineToPolygon({ x: 0, y: 0 }, { x: 10, y: 0 }, 4)).toEqual([
			{ x: 0, y: 2 },
			{ x: 10, y: 2 },
			{ x: 10, y: -2 },
			{ x: 0, y: -2 },
		]);
	});

	it('creates a polygon around a vertical line', () => {
		expect(lineToPolygon({ x: 0, y: 0 }, { x: 0, y: 10 }, 4)).toEqual([
			{ x: -2, y: 0 },
			{ x: -2, y: 10 },
			{ x: 2, y: 10 },
			{ x: 2, y: 0 },
		]);
	});

	it('creates a polygon around a diagonal line', () => {
		expect(lineToPolygon({ x: 0, y: 0 }, { x: 3, y: 4 }, 10)).toEqual([
			{ x: -4, y: 3 },
			{ x: -1, y: 7 },
			{ x: 7, y: 1 },
			{ x: 4, y: -3 },
		]);
	});

	it('uses the default thickness', () => {
		expect(lineToPolygon({ x: 0, y: 0 }, { x: 10, y: 0 })).toEqual([
			{ x: 0, y: 7.5 },
			{ x: 10, y: 7.5 },
			{ x: 10, y: -7.5 },
			{ x: 0, y: -7.5 },
		]);
	});

	it('creates the current square-like polygon for a zero-length line', () => {
		expect(lineToPolygon({ x: 2, y: 3 }, { x: 2, y: 3 }, 4)).toEqual([
			{ x: 4, y: 5 },
			{ x: 4, y: 5 },
			{ x: 0, y: 1 },
			{ x: 0, y: 1 },
		]);
	});
});
