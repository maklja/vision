import { describe, expect, it } from 'vitest';
import {
	BoundingBox,
	boundingBoxesIntersection,
	boundingBoxLineIntersection,
	boundingBoxLinesIntersection,
	normalizeBoundingBox,
	pointOverlapBoundingBox,
} from './BoundingBox';

describe('BoundingBox', () => {
	it('calculates corners, center, and polygon points', () => {
		const boundingBox = new BoundingBox(10, 20, 30, 40);

		expect(boundingBox.topLeft).toEqual({ x: 10, y: 20 });
		expect(boundingBox.topRight).toEqual({ x: 40, y: 20 });
		expect(boundingBox.bottomLeft).toEqual({ x: 10, y: 60 });
		expect(boundingBox.bottomRight).toEqual({ x: 40, y: 60 });
		expect(boundingBox.center).toEqual({ x: 25, y: 40 });
		expect(boundingBox.points).toEqual([
			{ x: 10, y: 20 },
			{ x: 40, y: 20 },
			{ x: 40, y: 60 },
			{ x: 10, y: 60 },
		]);
	});

	it('creates empty and copied bounding boxes', () => {
		expect(BoundingBox.empty()).toEqual(new BoundingBox(0, 0, 0, 0));
		expect(BoundingBox.empty(5, -3)).toEqual(new BoundingBox(5, -3, 0, 0));
		expect(BoundingBox.copy({ x: 1, y: 2, width: 3, height: 4 })).toEqual(
			new BoundingBox(1, 2, 3, 4),
		);
	});

	it('creates the union of overlapping and separated boxes', () => {
		expect(new BoundingBox(10, 10, 20, 20).union(new BoundingBox(20, 0, 30, 15))).toEqual(
			new BoundingBox(10, 0, 40, 30),
		);
		expect(new BoundingBox(-10, -5, 5, 5).union(new BoundingBox(10, 15, 5, 10))).toEqual(
			new BoundingBox(-10, -5, 25, 30),
		);
	});

	it.each([
		[
			{ x: 10, y: 20, width: 30, height: 40 },
			{ x: 10, y: 20, width: 30, height: 40 },
		],
		[
			{ x: 10, y: 20, width: -30, height: 40 },
			{ x: -20, y: 20, width: 30, height: 40 },
		],
		[
			{ x: 10, y: 20, width: 30, height: -40 },
			{ x: 10, y: -20, width: 30, height: 40 },
		],
		[
			{ x: 10, y: 20, width: -30, height: -40 },
			{ x: -20, y: -20, width: 30, height: 40 },
		],
	] as const)('normalizes positive and negative dimensions', (input, expected) => {
		expect(normalizeBoundingBox(input)).toEqual(expected);
		expect(new BoundingBox(input.x, input.y, input.width, input.height).normalize()).toEqual(
			expected,
		);
	});
});

describe('bounding-box overlap', () => {
	const boundingBox = new BoundingBox(10, 20, 30, 40);

	it.each([
		[{ x: 10, y: 20 }, true],
		[{ x: 40, y: 60 }, true],
		[{ x: 25, y: 40 }, true],
		[{ x: 9.999, y: 40 }, false],
		[{ x: 25, y: 60.001 }, false],
	] as const)('checks whether a point overlaps inclusive edges', (point, expected) => {
		expect(pointOverlapBoundingBox(point, boundingBox)).toBe(expected);
	});

	it.each([
		[new BoundingBox(20, 30, 5, 5), true],
		[new BoundingBox(0, 0, 100, 100), true],
		[new BoundingBox(40, 60, 5, 5), true],
		[new BoundingBox(-20, 30, 30, 5), true],
		[new BoundingBox(40.001, 20, 5, 5), false],
		[new BoundingBox(10, 60.001, 5, 5), false],
	] as const)('checks overlap and inclusive box boundaries', (other, expected) => {
		expect(boundingBoxesIntersection(boundingBox, other)).toBe(expected);
		expect(boundingBox.intersects(other)).toBe(expected);
	});
});

describe('bounding-box line intersection', () => {
	const boundingBox = new BoundingBox(10, 20, 30, 40);

	it.each([
		[
			[
				{ x: 20, y: 30 },
				{ x: 50, y: 30 },
			],
			true,
		],
		[
			[
				{ x: 0, y: 40 },
				{ x: 50, y: 40 },
			],
			true,
		],
		[
			[
				{ x: 50, y: 40 },
				{ x: 0, y: 40 },
			],
			true,
		],
		[
			[
				{ x: 25, y: 0 },
				{ x: 25, y: 80 },
			],
			true,
		],
		[
			[
				{ x: 25, y: 80 },
				{ x: 25, y: 0 },
			],
			true,
		],
		[
			[
				{ x: 0, y: 0 },
				{ x: 9, y: 19 },
			],
			false,
		],
		[
			[
				{ x: 0, y: 20 },
				{ x: 50, y: 20 },
			],
			false,
		],
		[
			[
				{ x: 10, y: 20 },
				{ x: 0, y: 20 },
			],
			true,
		],
	] as const)('characterizes segment intersections at edges', (line, expected) => {
		expect(boundingBoxLineIntersection(boundingBox, [line[0], line[1]])).toBe(expected);
	});

	it('checks every segment in a polyline', () => {
		const line = [
			{ x: 0, y: 0 },
			{ x: 5, y: 5 },
			{ x: 20, y: 30 },
		];

		expect(boundingBoxLinesIntersection(boundingBox, line)).toBe(true);
		expect(boundingBox.intersectsWithLine(line)).toBe(true);
		expect(boundingBoxLinesIntersection(boundingBox, [{ x: 0, y: 0 }])).toBe(false);
		expect(boundingBoxLinesIntersection(boundingBox, [])).toBe(false);
	});
});
