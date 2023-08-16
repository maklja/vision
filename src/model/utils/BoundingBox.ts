export class BoundingBox {
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

	static empty(x = 0, y = 0) {
		return new BoundingBox(x, y);
	}
}

