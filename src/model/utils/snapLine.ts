import { Point } from '../common';
import { BoundingBox } from './BoundingBox';

export enum SnapLineOrientation {
	Vertical = 0,
	Horizontal = 1,
}

export interface SnapLine {
	points: [Point, Point];
	distance: number;
	length: number;
	orientation: SnapLineOrientation;
}

export const horizontalSnapLinesDistances = (bb1: BoundingBox, bb2: BoundingBox): number[] => {
	const { topLeft: bb1TopLeft, center: bb1Center, bottomLeft: bb1BottomLeft } = bb1;
	const { topLeft: bb2TopLeft, bottomLeft: bb2BottomLeft } = bb2;
	const horizontalLinePoints = [
		[bb1TopLeft.y, bb2TopLeft.y],
		[bb1Center.y, bb2TopLeft.y],
		[bb1BottomLeft.y, bb2TopLeft.y],
		[bb1TopLeft.y, bb2BottomLeft.y],
		[bb1Center.y, bb2BottomLeft.y],
		[bb1BottomLeft.y, bb2BottomLeft.y],
	];

	return horizontalLinePoints.map(([p0, p1]) => Math.abs(p0 - p1));
};

export const verticalSnapLinesDistances = (bb1: BoundingBox, bb2: BoundingBox): number[] => {
	const { topLeft: bb1TopLeft, center: bb1Center, topRight: bb1TopRight } = bb1;
	const { topLeft: bb2TopLeft, topRight: bb2TopRight } = bb2;
	const verticalLinePoints = [
		[bb1TopLeft.x, bb2TopLeft.x],
		[bb1Center.x, bb2TopLeft.x],
		[bb1TopRight.x, bb2TopLeft.x],
		[bb1TopLeft.x, bb2TopRight.x],
		[bb1Center.x, bb2TopRight.x],
		[bb1TopRight.x, bb2TopRight.x],
	];

	return verticalLinePoints.map(([p0, p1]) => Math.abs(p0 - p1));
};

export const snapLinesDistances = (bb1: BoundingBox, bb2: BoundingBox): number[] => {
	return [...horizontalSnapLinesDistances(bb1, bb2), ...verticalSnapLinesDistances(bb1, bb2)];
};

const createHorizontalSnapLine = (
	x1: number,
	x2: number,
	y: number,
	distance: number,
): SnapLine => ({
	points: [
		{
			x: x1,
			y,
		},
		{
			x: x2,
			y,
		},
	],
	distance,
	length: Math.abs(x1 - x2),
	orientation: SnapLineOrientation.Horizontal,
});

const createVerticalSnapLine = (y1: number, y2: number, x: number, distance: number): SnapLine => ({
	points: [
		{
			x,
			y: y1,
		},
		{
			x,
			y: y2,
		},
	],
	distance,
	length: Math.abs(y1 - y2),
	orientation: SnapLineOrientation.Vertical,
});

export const createHorizontalSnapLines = (bb1: BoundingBox, bb2: BoundingBox): SnapLine[] => {
	const {
		topLeft: bb1TopLeft,
		center: bb1Center,
		bottomLeft: bb1BottomLeft,
		topRight: bb1TopRight,
	} = bb1;
	const { topLeft: bb2TopLeft, bottomLeft: bb2BottomLeft, topRight: bb2TopRight } = bb2;

	const xMinHorizontal = Math.min(bb1TopLeft.x, bb2TopLeft.x);
	const xMaxHorizontal = Math.max(bb1TopRight.x, bb2TopRight.x);

	const topToTop = createHorizontalSnapLine(
		xMinHorizontal,
		xMaxHorizontal,
		bb1TopLeft.y,
		bb1TopLeft.y - bb2TopLeft.y,
	);
	const topToMiddle = createHorizontalSnapLine(
		xMinHorizontal,
		xMaxHorizontal,
		bb1Center.y,
		bb1Center.y - bb2TopLeft.y,
	);
	const topToBottom = createHorizontalSnapLine(
		xMinHorizontal,
		xMaxHorizontal,
		bb1BottomLeft.y,
		bb1BottomLeft.y - bb2TopLeft.y,
	);

	const bottomToTop = createHorizontalSnapLine(
		xMinHorizontal,
		xMaxHorizontal,
		bb1TopLeft.y,
		bb1TopLeft.y - bb2BottomLeft.y,
	);
	const bottomToMiddle = createHorizontalSnapLine(
		xMinHorizontal,
		xMaxHorizontal,
		bb1Center.y,
		bb1Center.y - bb2BottomLeft.y,
	);
	const bottomToBottom = createHorizontalSnapLine(
		xMinHorizontal,
		xMaxHorizontal,
		bb1BottomLeft.y,
		bb1BottomLeft.y - bb2BottomLeft.y,
	);

	return [topToTop, topToMiddle, topToBottom, bottomToTop, bottomToMiddle, bottomToBottom];
};

export const createVerticalSnapLines = (bb1: BoundingBox, bb2: BoundingBox): SnapLine[] => {
	const {
		topLeft: bb1TopLeft,
		center: bb1Center,
		bottomLeft: bb1BottomLeft,
		topRight: bb1TopRight,
	} = bb1;
	const { topLeft: bb2TopLeft, bottomLeft: bb2BottomLeft, topRight: bb2TopRight } = bb2;

	const yMinVertical = Math.min(bb1TopLeft.y, bb2TopLeft.y);
	const yMaxVertical = Math.max(bb1BottomLeft.y, bb2BottomLeft.y);

	const leftToLeft: SnapLine = createVerticalSnapLine(
		yMinVertical,
		yMaxVertical,
		bb1TopLeft.x,
		bb1TopLeft.x - bb2TopLeft.x,
	);
	const leftToMiddle: SnapLine = createVerticalSnapLine(
		yMinVertical,
		yMaxVertical,
		bb1Center.x,
		bb1Center.x - bb2TopLeft.x,
	);
	const leftToRight: SnapLine = createVerticalSnapLine(
		yMinVertical,
		yMaxVertical,
		bb1TopRight.x,
		bb1TopRight.x - bb2TopLeft.x,
	);
	const rightToLeft: SnapLine = createVerticalSnapLine(
		yMinVertical,
		yMaxVertical,
		bb1TopLeft.x,
		bb1TopLeft.x - bb2TopRight.x,
	);
	const rightToMiddle: SnapLine = createVerticalSnapLine(
		yMinVertical,
		yMaxVertical,
		bb1Center.x,
		bb1Center.x - bb2TopRight.x,
	);
	const rightToRight: SnapLine = createVerticalSnapLine(
		yMinVertical,
		yMaxVertical,
		bb1TopRight.x,
		bb1TopRight.x - bb2TopRight.x,
	);

	return [leftToLeft, leftToMiddle, leftToRight, rightToLeft, rightToMiddle, rightToRight];
};

export const createSnapLines = (bb1: BoundingBox, bb2: BoundingBox): SnapLine[] => [
	...createHorizontalSnapLines(bb1, bb2),
	...createVerticalSnapLines(bb1, bb2),
];
