import { useMemo } from 'react';
import { ElementType, ElementGroup, mapElementTypeToGroup, Point, BoundingBox } from '../model';

export enum ElementShape {
	Circle = 'circle',
	Rectangle = 'rectangle',
}

export interface FontSizes {
	readonly primary: number;
}

interface SizeConfig {
	readonly drawerSizes: {
		readonly width: number;
		readonly height: number;
		readonly radius: number;
	};
	readonly fontSizes: FontSizes;
}

const defaultSizeConfig: SizeConfig = {
	drawerSizes: {
		radius: 50,
		width: 125,
		height: 95,
	},
	fontSizes: {
		primary: 15,
	},
};

export interface CircleShapeSize {
	readonly type: ElementShape.Circle;
	readonly radius: number;
	readonly fontSizes: FontSizes;
}

export interface RectangleShapeSize {
	readonly type: ElementShape.Rectangle;
	readonly width: number;
	readonly height: number;
	readonly fontSizes: FontSizes;
}

export type ShapeSize = CircleShapeSize | RectangleShapeSize;

export type ElementSizes = {
	readonly [key in ElementGroup]?: ShapeSize;
};

export interface SizesOptions {
	readonly scale: number;
}

export type ElementSizesContext = {
	readonly sizes: ElementSizes;
	readonly options: SizesOptions;
};

export const fromSize = (value: number, scale = 1, factor = 1) => value * scale * factor;

export const scaleCircleShape = (
	circleShapeSize: CircleShapeSize,
	scale: number,
): CircleShapeSize => {
	if (scale === 1) {
		return circleShapeSize;
	}

	const { fontSizes, radius } = circleShapeSize;
	return {
		type: ElementShape.Circle,
		radius: fromSize(radius, scale),
		fontSizes: {
			primary: fromSize(fontSizes.primary, scale),
		},
	};
};

export const scaleRectangleShape = (
	rectangleShapeSize: RectangleShapeSize,
	scale: number,
): RectangleShapeSize => {
	if (scale === 1) {
		return rectangleShapeSize;
	}

	const { fontSizes, width, height } = rectangleShapeSize;
	return {
		type: ElementShape.Rectangle,
		width: fromSize(width, scale),
		height: fromSize(height, scale),
		fontSizes: {
			primary: fromSize(fontSizes.primary, scale),
		},
	};
};

export const scaleShapeSize = (shapeSize: ShapeSize, scale = 1) => {
	if (shapeSize.type === ElementShape.Circle) {
		return scaleCircleShape(shapeSize, scale);
	}

	if (shapeSize.type === ElementShape.Rectangle) {
		return scaleRectangleShape(shapeSize, scale);
	}

	throw new Error(`Unknown shape type ${shapeSize}`);
};

const defaultCircleShape: CircleShapeSize = {
	type: ElementShape.Circle,
	radius: defaultSizeConfig.drawerSizes.radius,
	fontSizes: defaultSizeConfig.fontSizes,
};

const defaultRectangleShape: RectangleShapeSize = {
	type: ElementShape.Rectangle,
	width: defaultSizeConfig.drawerSizes.width,
	height: defaultSizeConfig.drawerSizes.height,
	fontSizes: defaultSizeConfig.fontSizes,
};

const defaultElementSizes: ElementSizesContext = {
	sizes: {
		[ElementGroup.Creation]: defaultCircleShape,
		[ElementGroup.JoinCreation]: defaultCircleShape,
		[ElementGroup.Subscriber]: scaleCircleShape(defaultCircleShape, 0.4),
		[ElementGroup.ErrorHandling]: defaultRectangleShape,
		[ElementGroup.Filtering]: defaultRectangleShape,
		[ElementGroup.Result]: scaleCircleShape(defaultCircleShape, 0.7),
		[ElementGroup.ConnectPoint]: scaleCircleShape(defaultCircleShape, 0.32),
	},
	options: {
		scale: 1,
	},
};

export const createElementSizesContext = () => defaultElementSizes;

export const findElementSize = (sizes: ElementSizes, elType: ElementType) => {
	const elGroup = mapElementTypeToGroup(elType);
	const elSize = sizes[elGroup];

	if (!elSize) {
		throw new Error(`Unsupported element size for type ${elType}`);
	}

	return elSize;
};

export const findCircleShapeSize = (
	elSizesContext: ElementSizesContext,
	elType: ElementType,
): CircleShapeSize => {
	const { sizes, options } = elSizesContext;
	const shapeSize = findElementSize(sizes, elType);

	if (shapeSize.type !== ElementShape.Circle) {
		throw new Error(`Expected element shape circle but received ${shapeSize.type}`);
	}

	return scaleCircleShape(shapeSize, options.scale);
};

export const findRectangleShapeSize = (
	elSizesContext: ElementSizesContext,
	elType: ElementType,
): RectangleShapeSize => {
	const { sizes, options } = elSizesContext;
	const shapeSize = findElementSize(sizes, elType);

	if (shapeSize.type !== ElementShape.Rectangle) {
		throw new Error(`Expected element shape rectangle but received ${shapeSize.type}`);
	}

	return scaleRectangleShape(shapeSize, options.scale);
};

export const useCircleSizeScale = (circleShapeSize: CircleShapeSize, scale: number) =>
	useMemo(() => scaleCircleShape(circleShapeSize, scale), [circleShapeSize, scale]);

export const useRectangleSizeScale = (rectangleShapeSize: RectangleShapeSize, scale: number) =>
	useMemo(() => scaleRectangleShape(rectangleShapeSize, scale), [rectangleShapeSize, scale]);

export const calculateShapeSizeBoundingBox = (position: Point, shape: ShapeSize): BoundingBox => {
	if (shape.type === ElementShape.Circle) {
		return new BoundingBox(position.x, position.y, shape.radius * 2, shape.radius * 2);
	}

	if (shape.type === ElementShape.Rectangle) {
		return new BoundingBox(position.x, position.y, shape.width, shape.height);
	}

	throw new Error('Unsupported shape type received for bounding box creation');
};

