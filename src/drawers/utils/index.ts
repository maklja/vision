import { BoundingBox } from './BoundingBox';

export * from './BoundingBox';

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

export const createBoundingBox = (x: number, y: number, size = 1) => {
	const width = fromSize(DRAWER_DEFAULT.width, size);
	const height = fromSize(DRAWER_DEFAULT.height, size);

	return new BoundingBox(x, y, width, height);
};

