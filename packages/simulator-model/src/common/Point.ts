export interface Point {
	x: number;
	y: number;
}

export const distanceBetweenPoints = (p0: Point, p1: Point) =>
	Math.sqrt((p0.x - p1.x) * (p0.x - p1.x) + (p0.y - p1.y) * (p0.y - p1.y));
