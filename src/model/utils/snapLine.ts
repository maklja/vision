import { BoundingBox } from './BoundingBox';

const horizontalSnapLinesDistance = (bb1: BoundingBox, bb2: BoundingBox): number => {
	// const { topLeft, bottomLeft, center } = bb1;
	const horizontalLinePoints = [
		[bb1.topLeft.y, bb2.topLeft.y],
		[bb1.center.y, bb2.topLeft.y],
		[bb1.bottomLeft.y, bb2.topLeft.y],
		[bb1.topLeft.y, bb2.bottomLeft.y],
		[bb1.center.y, bb2.bottomLeft.y],
		[bb1.bottomLeft.y, bb2.bottomLeft.y],
	];
};
