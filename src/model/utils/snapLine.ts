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
	const {
		topLeft: bb2TopLeft,
		center: bb2Center,
		bottomLeft: bb2BottomLeft,
		topRight: bb2TopRight,
	} = bb2;

	const xMinHorizontal = Math.min(bb1TopLeft.x, bb2TopLeft.x);
	const xMaxHorizontal = Math.max(bb1TopRight.x, bb2TopRight.x);

	const topToTop = createHorizontalSnapLine(
		xMinHorizontal,
		xMaxHorizontal,
		bb1TopLeft.y,
		bb1TopLeft.y - bb2TopLeft.y,
	);
	const topToCenter = createHorizontalSnapLine(
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

	const centerToTop = createHorizontalSnapLine(
		xMinHorizontal,
		xMaxHorizontal,
		bb1TopLeft.y,
		bb1TopLeft.y - bb2Center.y,
	);
	const centerToCenter = createHorizontalSnapLine(
		xMinHorizontal,
		xMaxHorizontal,
		bb1Center.y,
		bb1Center.y - bb2Center.y,
	);
	const centerToBottom = createHorizontalSnapLine(
		xMinHorizontal,
		xMaxHorizontal,
		bb1BottomLeft.y,
		bb1BottomLeft.y - bb2Center.y,
	);

	const bottomToTop = createHorizontalSnapLine(
		xMinHorizontal,
		xMaxHorizontal,
		bb1TopLeft.y,
		bb1TopLeft.y - bb2BottomLeft.y,
	);
	const bottomToCenter = createHorizontalSnapLine(
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

	return [
		topToTop,
		topToCenter,
		topToBottom,
		bottomToTop,
		bottomToCenter,
		bottomToBottom,
		centerToTop,
		centerToCenter,
		centerToBottom,
	];
};

export const createVerticalSnapLines = (bb1: BoundingBox, bb2: BoundingBox): SnapLine[] => {
	const {
		topLeft: bb1TopLeft,
		center: bb1Center,
		bottomLeft: bb1BottomLeft,
		topRight: bb1TopRight,
	} = bb1;
	const {
		topLeft: bb2TopLeft,
		center: bb2Center,
		bottomLeft: bb2BottomLeft,
		topRight: bb2TopRight,
	} = bb2;

	const yMinVertical = Math.min(bb1TopLeft.y, bb2TopLeft.y);
	const yMaxVertical = Math.max(bb1BottomLeft.y, bb2BottomLeft.y);

	const leftToLeft: SnapLine = createVerticalSnapLine(
		yMinVertical,
		yMaxVertical,
		bb1TopLeft.x,
		bb1TopLeft.x - bb2TopLeft.x,
	);
	const leftToCenter: SnapLine = createVerticalSnapLine(
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

	const centerToLeft: SnapLine = createVerticalSnapLine(
		yMinVertical,
		yMaxVertical,
		bb1TopLeft.x,
		bb1TopLeft.x - bb2Center.x,
	);
	const centerToCenter: SnapLine = createVerticalSnapLine(
		yMinVertical,
		yMaxVertical,
		bb1Center.x,
		bb1Center.x - bb2Center.x,
	);
	const centerToRight: SnapLine = createVerticalSnapLine(
		yMinVertical,
		yMaxVertical,
		bb1TopRight.x,
		bb1TopRight.x - bb2Center.x,
	);

	const rightToLeft: SnapLine = createVerticalSnapLine(
		yMinVertical,
		yMaxVertical,
		bb1TopLeft.x,
		bb1TopLeft.x - bb2TopRight.x,
	);
	const rightToCenter: SnapLine = createVerticalSnapLine(
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

	return [
		leftToLeft,
		leftToCenter,
		leftToRight,
		rightToLeft,
		rightToCenter,
		rightToRight,
		centerToLeft,
		centerToCenter,
		centerToRight,
	];
};

export const createBoundingBoxSnapLines = (bb1: BoundingBox, bb2: BoundingBox): SnapLine[] => [
	...createHorizontalSnapLines(bb1, bb2),
	...createVerticalSnapLines(bb1, bb2),
];

export const createPointSnapLines = (p1: Point, p2: Point) => {
	const xMinHorizontal = Math.min(p1.x, p2.x);
	const xMaxHorizontal = Math.max(p1.x, p2.x);

	const horizontalSnapLine = createHorizontalSnapLine(xMinHorizontal, xMaxHorizontal, p1.y, p1.y);

	const yMinVertical = Math.min(p1.y, p2.y);
	const yMaxVertical = Math.max(p1.y, p2.y);

	const verticalSnapLine: SnapLine = createVerticalSnapLine(
		yMinVertical,
		yMaxVertical,
		p1.x,
		p1.x,
	);

	return [horizontalSnapLine, verticalSnapLine];
};

export const boundingBoxTouch = (bb1: BoundingBox, bb2: BoundingBox): boolean => {
	const { topLeft: bb1TopLeft, bottomRight: bb1BottomRight } = bb1;
	const { topLeft: bb2TopLeft, bottomRight: bb2BottomRight } = bb2;

	const horizontalTouchExist =
		bb1BottomRight.y >= bb2TopLeft.y && bb1TopLeft.y <= bb2BottomRight.y;
	const verticalTouchExist = bb1TopLeft.x <= bb2.topRight.x && bb1BottomRight.x >= bb2TopLeft.x;

	return verticalTouchExist || horizontalTouchExist;
};

export const snapLinesDistance = (snapLine1: SnapLine, snapLine2: SnapLine) => {
	if (snapLine1.orientation !== snapLine2.orientation) {
		return Infinity;
	}

	return snapLine1.orientation === SnapLineOrientation.Horizontal
		? Math.abs(snapLine1.points[0].y - snapLine2.points[0].y)
		: Math.abs(snapLine1.points[0].x - snapLine2.points[0].x);
};

