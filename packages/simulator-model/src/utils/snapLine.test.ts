import { describe, expect, it } from 'vitest';
import { BoundingBox } from './BoundingBox';
import {
	SnapLine,
	SnapLineOrientation,
	boundingBoxTouch,
	createBoundingBoxSnapLines,
	createHorizontalSnapLines,
	createPointSnapLines,
	createVerticalSnapLines,
	snapLinesDistance,
} from './snapLine';

const firstBox = new BoundingBox(0, 0, 10, 20);
const secondBox = new BoundingBox(30, 40, 20, 10);

describe('bounding-box snap lines', () => {
	it('creates all horizontal edge and center comparisons', () => {
		const lines = createHorizontalSnapLines(firstBox, secondBox);

		expect(lines).toHaveLength(9);
		expect(lines.map((line) => line.distance)).toEqual([
			-40, -30, -20, -50, -40, -30, -45, -35, -25,
		]);
		expect(lines.map((line) => line.length)).toEqual(new Array(9).fill(50));
		expect(lines.map((line) => line.orientation)).toEqual(
			new Array(9).fill(SnapLineOrientation.Horizontal),
		);
		expect(lines.map((line) => line.points)).toEqual([
			[
				{ x: 0, y: 0 },
				{ x: 50, y: 0 },
			],
			[
				{ x: 0, y: 10 },
				{ x: 50, y: 10 },
			],
			[
				{ x: 0, y: 20 },
				{ x: 50, y: 20 },
			],
			[
				{ x: 0, y: 0 },
				{ x: 50, y: 0 },
			],
			[
				{ x: 0, y: 10 },
				{ x: 50, y: 10 },
			],
			[
				{ x: 0, y: 20 },
				{ x: 50, y: 20 },
			],
			[
				{ x: 0, y: 0 },
				{ x: 50, y: 0 },
			],
			[
				{ x: 0, y: 10 },
				{ x: 50, y: 10 },
			],
			[
				{ x: 0, y: 20 },
				{ x: 50, y: 20 },
			],
		]);
	});

	it('creates all vertical edge and center comparisons', () => {
		const lines = createVerticalSnapLines(firstBox, secondBox);

		expect(lines).toHaveLength(9);
		expect(lines.map((line) => line.distance)).toEqual([
			-30, -25, -20, -50, -45, -40, -40, -35, -30,
		]);
		expect(lines.map((line) => line.length)).toEqual(new Array(9).fill(50));
		expect(lines.map((line) => line.orientation)).toEqual(
			new Array(9).fill(SnapLineOrientation.Vertical),
		);
		expect(lines.map((line) => line.points)).toEqual([
			[
				{ x: 0, y: 0 },
				{ x: 0, y: 50 },
			],
			[
				{ x: 5, y: 0 },
				{ x: 5, y: 50 },
			],
			[
				{ x: 10, y: 0 },
				{ x: 10, y: 50 },
			],
			[
				{ x: 0, y: 0 },
				{ x: 0, y: 50 },
			],
			[
				{ x: 5, y: 0 },
				{ x: 5, y: 50 },
			],
			[
				{ x: 10, y: 0 },
				{ x: 10, y: 50 },
			],
			[
				{ x: 0, y: 0 },
				{ x: 0, y: 50 },
			],
			[
				{ x: 5, y: 0 },
				{ x: 5, y: 50 },
			],
			[
				{ x: 10, y: 0 },
				{ x: 10, y: 50 },
			],
		]);
	});

	it('combines horizontal and vertical snap lines', () => {
		const lines = createBoundingBoxSnapLines(firstBox, secondBox);

		expect(lines).toHaveLength(18);
		expect(lines.slice(0, 9)).toEqual(createHorizontalSnapLines(firstBox, secondBox));
		expect(lines.slice(9)).toEqual(createVerticalSnapLines(firstBox, secondBox));
	});
});

describe('point snap lines', () => {
	it('creates one horizontal and one vertical line between two points', () => {
		expect(createPointSnapLines({ x: 10, y: 20 }, { x: 30, y: 5 })).toEqual([
			{
				points: [
					{ x: 10, y: 5 },
					{ x: 30, y: 5 },
				],
				distance: 15,
				length: 20,
				orientation: SnapLineOrientation.Horizontal,
			},
			{
				points: [
					{ x: 30, y: 5 },
					{ x: 30, y: 20 },
				],
				distance: -20,
				length: 15,
				orientation: SnapLineOrientation.Vertical,
			},
		]);
	});
});

describe('boundingBoxTouch', () => {
	it.each([
		[new BoundingBox(5, 5, 10, 10), true],
		[new BoundingBox(10, 50, 10, 10), true],
		[new BoundingBox(50, 10, 10, 10), true],
		[new BoundingBox(10, 20, 10, 10), true],
		[new BoundingBox(50, 50, 10, 10), false],
	] as const)('characterizes overlap on either axis', (other, expected) => {
		expect(boundingBoxTouch(firstBox, other)).toBe(expected);
	});
});

describe('snapLinesDistance', () => {
	const horizontalLine: SnapLine = {
		points: [
			{ x: 0, y: 10 },
			{ x: 20, y: 10 },
		],
		distance: 0,
		length: 20,
		orientation: SnapLineOrientation.Horizontal,
	};
	const verticalLine: SnapLine = {
		points: [
			{ x: 4, y: 0 },
			{ x: 4, y: 20 },
		],
		distance: 0,
		length: 20,
		orientation: SnapLineOrientation.Vertical,
	};

	it('calculates distance between lines with the same orientation', () => {
		expect(
			snapLinesDistance(horizontalLine, {
				...horizontalLine,
				points: [
					{ x: 0, y: 16 },
					{ x: 20, y: 16 },
				],
			}),
		).toBe(6);
		expect(
			snapLinesDistance(verticalLine, {
				...verticalLine,
				points: [
					{ x: -3, y: 0 },
					{ x: -3, y: 20 },
				],
			}),
		).toBe(7);
	});

	it('returns infinity for lines with different orientations', () => {
		expect(snapLinesDistance(horizontalLine, verticalLine)).toBe(Number.POSITIVE_INFINITY);
	});
});
