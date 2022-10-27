export const DRAWER_DEFAULT = {
	radius: 24,
	width: 48,
	height: 48,
	textFontSize: 14,
	iconFontSize: 11,
};

export const CONNECTOR_DEFAULT = {
	radius: 6,
	offset: 10,
};

export const fromSize = (value: number, size = 1, factor = 1) => value * size * factor;

export const rectSize = (size = 1, factor = 1) => {
	const width = fromSize(DRAWER_DEFAULT.width, size, factor);
	const height = fromSize(DRAWER_DEFAULT.height, size, factor);

	return { width, height };
};

class BoundingBox {
	private readonly width: number;
	private readonly height: number;

	constructor(private readonly x = 0, private readonly y = 0, private readonly size = 1) {
		this.width = x + fromSize(DRAWER_DEFAULT.width, size);
		this.height = this.y + fromSize(DRAWER_DEFAULT.height, size);
	}

	public get topLeft() {
		return { x: this.x, y: this.y };
	}

	public get topRight() {
		return { x: this.x + this.width, y: this.y };
	}
}

export const createBoundingBox = (x: number, y: number, size = 1) => {};
