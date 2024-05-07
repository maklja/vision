import { Point } from '../common';

export interface IBoundingBox {
	readonly x: number;
	readonly y: number;
	readonly width: number;
	readonly height: number;
}

export class BoundingBox implements IBoundingBox {
	constructor(
		public readonly x = 0,
		public readonly y = 0,
		public readonly width = 0,
		public readonly height = 0,
	) {}

	get topLeft() {
		return { x: this.x, y: this.y };
	}

	get topRight() {
		return { x: this.x + this.width, y: this.y };
	}

	get bottomLeft() {
		return { x: this.x, y: this.y + this.height };
	}

	get bottomRight() {
		return { x: this.x + this.width, y: this.y + this.height };
	}

	get center() {
		return { x: this.x + this.width / 2, y: this.y + this.height / 2 };
	}

	get points() {
		return [this.topLeft, this.topRight, this.bottomRight, this.bottomLeft];
	}

	static empty(x = 0, y = 0) {
		return new BoundingBox(x, y);
	}

	static copy(bb: IBoundingBox) {
		return new BoundingBox(bb.x, bb.y, bb.width, bb.height);
	}

	intersects(bb: IBoundingBox) {
		return boundingBoxesIntersection(this, bb);
	}

	intersectsWithLine(line: Point[]) {
		return boundingBoxLinesIntersection(this, line);
	}

	normalize() {
		return normalizeBoundingBox(this);
	}
}

export function pointOverlapBoundingBox(p: Point, bb: IBoundingBox) {
	return bb.x <= p.x && p.x <= bb.x + bb.width && bb.y <= p.y && p.y <= bb.y + bb.height;
}

export function normalizeBoundingBox(bb: IBoundingBox): IBoundingBox {
	const { x, y, width, height } = bb;

	const newX = width < 0 ? x + width : x;
	const newY = height < 0 ? y + height : y;

	return {
		x: newX,
		y: newY,
		width: Math.abs(width),
		height: Math.abs(height),
	};
}

export function boundingBoxesIntersection(bb1: IBoundingBox, bb2: IBoundingBox) {
	const bb1TopLeft = { x: bb1.x, y: bb1.y };
	const bb1BottomRight = { x: bb1.x + bb1.width, y: bb1.y + bb1.height };

	const bb2TopLeft = { x: bb2.x, y: bb2.y };
	const bb2BottomRight = { x: bb2.x + bb2.width, y: bb2.y + bb2.height };

	return !(
		bb1BottomRight.x < bb2TopLeft.x ||
		bb2BottomRight.x < bb1TopLeft.x ||
		bb1BottomRight.y < bb2TopLeft.y ||
		bb2BottomRight.y < bb1TopLeft.y
	);
}

export function boundingBoxLinesIntersection(bb: IBoundingBox, line: Point[]) {
	return line
		.slice(0, -1)
		.some((point, index) => boundingBoxLineIntersection(bb, [point, line[index + 1]]));
}

export function boundingBoxLineIntersection(bb: IBoundingBox, line: [Point, Point]) {
	const topLeft = { x: bb.x, y: bb.y };
	const bottomRight = { x: bb.x + bb.width, y: bb.y + bb.height };
	const [p1, p2] = line;

	//  If the start or end of the line is inside the rect then we assume
	//  collision, as rects are solid for our use-case.
	if (
		(p1.x >= topLeft.x &&
			p1.x <= bottomRight.x &&
			p1.y >= topLeft.y &&
			p1.y <= bottomRight.y) ||
		(p2.x >= topLeft.x && p2.x <= bottomRight.x && p2.y >= topLeft.y && p2.y <= bottomRight.y)
	) {
		return true;
	}

	if (p1.x < topLeft.x && p2.x >= topLeft.x) {
		//  Left edge
		const t = p1.y + ((p2.y - p1.y) * (topLeft.x - p1.x)) / (p2.x - p1.x);
		if (t > topLeft.y && t <= bottomRight.y) {
			return true;
		}
	} else if (p1.x > bottomRight.x && p2.x <= bottomRight.x) {
		//  Right edge
		const t = p1.y + ((p2.y - p1.y) * (bottomRight.x - p1.x)) / (p2.x - p1.x);
		if (t >= topLeft.y && t <= bottomRight.y) {
			return true;
		}
	}

	if (p1.y < topLeft.y && p2.y >= topLeft.y) {
		//  Top edge
		const t = p1.x + ((p2.x - p1.x) * (topLeft.y - p1.y)) / (p2.y - p1.y);
		if (t >= topLeft.x && t <= bottomRight.x) {
			return true;
		}
	} else if (p1.y > bottomRight.y && p2.y <= bottomRight.y) {
		//  Bottom edge
		const t = p1.x + ((p2.x - p1.x) * (bottomRight.y - p1.y)) / (p2.y - p1.y);
		if (t >= topLeft.x && t <= bottomRight.x) {
			return true;
		}
	}

	return false;
}

