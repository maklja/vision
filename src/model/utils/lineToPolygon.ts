import { Point } from '../common';

export const lineToPolygon = (
	p0: Point,
	p1: Point,
	thickness = 15,
): [Point, Point, Point, Point] => {
	const dx = p1.x - p0.x;
	const dy = p1.y - p0.y;
	const lineLength = Math.sqrt(dx * dx + dy * dy);
	const halfThickness = 0.5 * thickness;

	if (lineLength === 0) {
		return [
			{
				x: p0.x + halfThickness,
				y: p0.y + halfThickness,
			},
			{
				x: p1.x + halfThickness,
				y: p1.y + halfThickness,
			},
			{
				x: p1.x - halfThickness,
				y: p1.y - halfThickness,
			},
			{
				x: p0.x - halfThickness,
				y: p0.y - halfThickness,
			},
		];
	}

	const directionX = dx / lineLength;
	const directionY = dy / lineLength;

	const px = halfThickness * directionY * -1;
	const py = halfThickness * directionX;

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

