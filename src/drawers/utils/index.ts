import { BoundingBox } from './BoundingBox';

export * from './BoundingBox';

export const DRAWER_DEFAULT = {
	radius: 40,
	width: 80,
	height: 80,
	textFontSize: 15,
	iconFontSize: 12,
};

export const CONNECTOR_DEFAULT = {
	radius: 8,
	offset: 13,
};

export const fromSize = (value: number, size = 1, factor = 1) => value * size * factor;

export const createBoundingBox = (x: number, y: number, size = 1) => {
	const width = fromSize(DRAWER_DEFAULT.width, size);
	const height = fromSize(DRAWER_DEFAULT.height, size);

	return new BoundingBox(x, y, width, height);
};

