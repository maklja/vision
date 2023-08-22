import { Point } from '../common';

export const lineToPolygon = (
	p0: Point,
	p1: Point,
	thickness = 15,
): [Point, Point, Point, Point] => {
	const dx = p1.x - p0.x;
	const dy = p1.y - p0.y;
	const lineLength = Math.sqrt(dx * dx + dy * dy);

	const directionX = dx / lineLength;
	const directionY = dy / lineLength;

	const px = 0.5 * thickness * directionY * -1;
	const py = 0.5 * thickness * directionX;

	return [
		{
			x: p0.x + px,
			y: p0.y + py,
		},
		{
			x: p1.x + px,
			y: p1.y + py,
		},
		{
			x: p1.x - px,
			y: p1.y - py,
		},
		{
			x: p0.x - px,
			y: p0.y - py,
		},
	];
};

