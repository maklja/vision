import { Point } from '../common';

export function linesIntersection(p0: Point, p1: Point, p2: Point, p3: Point): Point {
	const slope1 = (p1.y - p0.y) / (p1.x - p0.x);
	const yIntercept1 = p0.y - slope1 * p0.x;

	const slope2 = (p3.y - p2.y) / (p3.x - p2.x);
	const yIntercept2 = p2.y - slope2 * p2.x;

	const x = (yIntercept2 - yIntercept1) / (slope1 - slope2);
	const y = slope1 * x + yIntercept1;

	if (isNaN(x) || isNaN(y)) {
		return p1;
	}

	return { x, y };
}

