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

	isPointOverlap(x: number, y: number) {
		const { topLeft, bottomRight } = this;

		return topLeft.x <= x && x <= bottomRight.x && topLeft.y <= y && y <= bottomRight.y;
	}

	static empty(x = 0, y = 0) {
		return new BoundingBox(x, y);
	}
}
