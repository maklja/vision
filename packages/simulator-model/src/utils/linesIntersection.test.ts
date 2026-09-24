import { describe, expect, it } from 'vitest';
import { linesIntersection } from './linesIntersection';

describe('linesIntersection', () => {
	it('finds the intersection of two diagonal infinite lines', () => {
		expect(
			linesIntersection({ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }, { x: 10, y: 0 }),
		).toEqual({ x: 5, y: 5 });
	});

	it('returns an intersection outside the supplied segments', () => {
		expect(
			linesIntersection({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 0 }, { x: 3, y: -1 }),
		).toEqual({ x: 1, y: 1 });
	});

	it('returns the first line endpoint for coincident lines', () => {
		expect(
			linesIntersection({ x: 0, y: 0 }, { x: 4, y: 4 }, { x: 2, y: 2 }, { x: 6, y: 6 }),
		).toEqual({ x: 4, y: 4 });
	});

	it('returns the first line endpoint when a vertical line produces an indeterminate result', () => {
		expect(
			linesIntersection({ x: 2, y: 0 }, { x: 2, y: 4 }, { x: 0, y: 2 }, { x: 4, y: 2 }),
		).toEqual({ x: 2, y: 4 });
	});

	it('preserves the current infinite result for parallel lines', () => {
		expect(
			linesIntersection({ x: 0, y: 0 }, { x: 2, y: 2 }, { x: 0, y: 1 }, { x: 2, y: 3 }),
		).toEqual({ x: Number.POSITIVE_INFINITY, y: Number.POSITIVE_INFINITY });
	});
});
