import { Point } from '../common';

export const doesLineInterceptCircle = (p1: Point, p2: Point, center: Point, radius: number) => {
	const v1x = p2.x - p1.x;
	const v1y = p2.y - p1.y;
	const v2x = center.x - p1.x;
	const v2y = center.y - p1.y;

	// get the unit distance along the line of the closest point to
	// circle center
	const u = (v2x * v1x + v2y * v1y) / (v1y * v1y + v1x * v1x);

	// if the point is on the line segment get the distance squared
	// from that point to the circle center
	let dist: number;
	if (u >= 0 && u <= 1) {
		dist = (p1.x + v1x * u - center.x) ** 2 + (p1.y + v1y * u - center.y) ** 2;
	} else {
		// if closest point not on the line segment
		// use the unit distance to determine which end is closest
		// and get dist square to circle
		dist =
			u < 0
				? (p1.x - center.x) ** 2 + (p1.y - center.y) ** 2
				: (p2.x - center.x) ** 2 + (p2.y - center.y) ** 2;
	}
	return dist < radius * radius;
};
