export class BoundingBox {
	constructor(
		public readonly x = 0,
		public readonly y = 0,
		public readonly width = 0,
		public readonly height = 0,
	) {}

	public get topLeft() {
		return { x: this.x, y: this.y };
	}

	public get topRight() {
		return { x: this.x + this.width, y: this.y };
	}

	public get bottomLeft() {
		return { x: this.x, y: this.y + this.height };
	}

	public get bottomRight() {
		return { x: this.x + this.width, y: this.y + this.height };
	}

	public get center() {
		return { x: this.x + this.width / 2, y: this.y + this.height / 2 };
	}
}

