import { useMemo } from 'react';
import {
	ElementType,
	ElementGroup,
	mapElementTypeToGroup,
	Point,
	BoundingBox,
} from '@maklja/vision-simulator-model';

export enum ElementShape {
	Circle = 'circle',
	Rectangle = 'rectangle',
}

export interface FontSizes {
	readonly primary: number;
	readonly secondary: number;
}

export interface LineSize {
	readonly arrowAngle: number;
	readonly arrowSize: number;
	readonly dotSize: number;
}

interface SizeConfig {
	readonly drawerSizes: {
		readonly width: number;
		readonly height: number;
		readonly radius: number;
	};
	readonly fontSizes: FontSizes;
	readonly lineSize: LineSize;
}

const defaultSizeConfig: SizeConfig = {
	drawerSizes: {
		radius: 50,
		width: 125,
		height: 100,
	},
	fontSizes: {
		primary: 15,
		secondary: 12,
	},
	lineSize: {
		arrowAngle: Math.PI / 6,
		arrowSize: 15,
		dotSize: 8,
	},
};

export interface CircleShapeSize {
	readonly type: ElementShape.Circle;
	readonly radius: number;
	readonly fontSizes: FontSizes;
	readonly margin: number;
}

export interface RectangleShapeSize {
	readonly type: ElementShape.Rectangle;
	readonly width: number;
	readonly height: number;
	readonly fontSizes: FontSizes;
	readonly margin: number;
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

	const { fontSizes, radius, margin } = circleShapeSize;
	return {
		type: ElementShape.Circle,
		radius: fromSize(radius, scale),
		margin: fromSize(margin, scale),
		fontSizes: {
			primary: fromSize(fontSizes.primary, scale),
			secondary: fromSize(fontSizes.secondary, scale),
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

	const { fontSizes, width, height, margin } = rectangleShapeSize;
	return {
		type: ElementShape.Rectangle,
		width: fromSize(width, scale),
		height: fromSize(height, scale),
		margin: fromSize(margin, scale),
		fontSizes: {
			primary: fromSize(fontSizes.primary, scale),
			secondary: fromSize(fontSizes.secondary, scale),
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

export const defaultCircleShape: CircleShapeSize = {
	type: ElementShape.Circle,
	radius: defaultSizeConfig.drawerSizes.radius,
	fontSizes: defaultSizeConfig.fontSizes,
	margin: 26,
};

export const defaultRectangleShape: RectangleShapeSize = {
	type: ElementShape.Rectangle,
	width: defaultSizeConfig.drawerSizes.width,
	height: defaultSizeConfig.drawerSizes.height,
	fontSizes: defaultSizeConfig.fontSizes,
	margin: 26,
};

const subscriberCircleShape: CircleShapeSize = {
	...scaleCircleShape(defaultCircleShape, 0.4),
	margin: 32,
};

const defaultElementSizes: ElementSizesContext = {
	sizes: {
		[ElementGroup.Creation]: defaultCircleShape,
		[ElementGroup.JoinCreation]: defaultCircleShape,
		[ElementGroup.Subscriber]: subscriberCircleShape,
		[ElementGroup.ErrorHandling]: defaultRectangleShape,
		[ElementGroup.Filtering]: defaultRectangleShape,
		[ElementGroup.Transformation]: defaultRectangleShape,
		[ElementGroup.Result]: scaleCircleShape(defaultCircleShape, 0.7),
		[ElementGroup.ConnectPoint]: scaleCircleShape(defaultCircleShape, 0.32),
	},
	options: {
		scale: 1,
	},
};

export const createElementSizesContext = () => defaultElementSizes;

export const findElementSize = (elSizesContext: ElementSizesContext, elType: ElementType) => {
	const elGroup = mapElementTypeToGroup(elType);
	const elSize = elSizesContext.sizes[elGroup];

	if (!elSize) {
		throw new Error(`Unsupported element size for type ${elType}`);
	}

	return scaleShapeSize(elSize, elSizesContext.options.scale);
};

export const findCircleShapeSize = (
	elSizesContext: ElementSizesContext,
	elType: ElementType,
): CircleShapeSize => {
	const shapeSize = findElementSize(elSizesContext, elType);

	if (shapeSize.type !== ElementShape.Circle) {
		throw new Error(`Expected element shape circle but received ${shapeSize.type}`);
	}

	return shapeSize;
};

export const findRectangleShapeSize = (
	elSizesContext: ElementSizesContext,
	elType: ElementType,
): RectangleShapeSize => {
	const shapeSize = findElementSize(elSizesContext, elType);

	if (shapeSize.type !== ElementShape.Rectangle) {
		throw new Error(`Expected element shape rectangle but received ${shapeSize.type}`);
	}

	return shapeSize;
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

export const useLineSize = (scale = 1): LineSize =>
	useMemo(
		() => ({
			arrowAngle: defaultSizeConfig.lineSize.arrowAngle,
			arrowSize: fromSize(defaultSizeConfig.lineSize.arrowSize, scale),
			dotSize: fromSize(defaultSizeConfig.lineSize.dotSize, scale),
		}),
		[scale],
	);
