import { useMemo } from 'react';
import { ElementType, ElementGroup, mapElementTypeToGroup, Point } from '../model';
import { BoundingBox } from '../drawers/utils';

export enum ElementShape {
	Circle = 'circle',
	Rectangle = 'rectangle',
}

export interface ConnectPointSizes {
	readonly width: number;
	readonly height: number;
	readonly radius: number;
}

export interface FontSizes {
	readonly primary: number;
}

export interface SizeConfig {
	readonly drawerSizes: {
		readonly width: number;
		readonly height: number;
		readonly radius: number;
	};
	readonly connectPointSizes: ConnectPointSizes;
	readonly simulationSizes: {
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
	simulationSizes: {
		radius: 14,
	},
	connectPointSizes: {
		radius: 16,
		width: 32,
		height: 32,
	},
	fontSizes: {
		primary: 15,
	},
};

export interface CircleShape {
	readonly type: ElementShape.Circle;
	readonly radius: number;
	readonly fontSizes: FontSizes;
	readonly connectPointSize: ConnectPointSizes;
}

export interface RectangleShape {
	readonly type: ElementShape.Rectangle;
	readonly width: number;
	readonly height: number;
	readonly fontSizes: FontSizes;
	readonly connectPointSize: ConnectPointSizes;
}

export type Shapes = CircleShape | RectangleShape;

export type ElementSizes = {
	readonly [key in ElementGroup]?: Shapes;
};

export interface SizesOptions {
	readonly scale: number;
}

export type ElementSizesContext = {
	readonly sizes: ElementSizes;
	readonly options: SizesOptions;
};

const defaultCircleShape: CircleShape = {
	type: ElementShape.Circle,
	radius: defaultSizeConfig.drawerSizes.radius,
	fontSizes: defaultSizeConfig.fontSizes,
	connectPointSize: defaultSizeConfig.connectPointSizes,
};

const defaultRectangleShape: RectangleShape = {
	type: ElementShape.Rectangle,
	width: defaultSizeConfig.drawerSizes.width,
	height: defaultSizeConfig.drawerSizes.height,
	fontSizes: defaultSizeConfig.fontSizes,
	connectPointSize: defaultSizeConfig.connectPointSizes,
};

const defaultElementSizes: ElementSizesContext = {
	sizes: {
		[ElementGroup.Creation]: defaultCircleShape,
		[ElementGroup.JoinCreation]: defaultCircleShape,
		[ElementGroup.Subscriber]: defaultCircleShape,
		[ElementGroup.ErrorHandling]: defaultRectangleShape,
		[ElementGroup.Filtering]: defaultRectangleShape,
	},
	options: {
		scale: 1,
	},
};

export const createElementSizesContext = () => defaultElementSizes;

export const fromSize = (value: number, scale = 1, factor = 1) => value * scale * factor;

export const scaleCircleShape = (circleShapeSize: CircleShape, scale: number): CircleShape => {
	const { connectPointSize, fontSizes, radius } = circleShapeSize;
	return {
		type: ElementShape.Circle,
		radius: fromSize(radius, scale),
		fontSizes: {
			primary: fromSize(fontSizes.primary, scale),
		},
		connectPointSize: {
			radius: fromSize(connectPointSize.radius, scale),
			width: fromSize(connectPointSize.width, scale),
			height: fromSize(connectPointSize.height, scale),
		},
	};
};

export const scaleRectangleShape = (
	rectangleShapeSize: RectangleShape,
	scale: number,
): RectangleShape => {
	const { connectPointSize, fontSizes, width, height } = rectangleShapeSize;
	return {
		type: ElementShape.Rectangle,
		width: fromSize(width, scale),
		height: fromSize(height, scale),
		fontSizes: {
			primary: fromSize(fontSizes.primary, scale),
		},
		connectPointSize: {
			radius: fromSize(connectPointSize.radius, scale),
			width: fromSize(connectPointSize.width, scale),
			height: fromSize(connectPointSize.height, scale),
		},
	};
};

const findElementSize = (sizes: ElementSizes, elType: ElementType) => {
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
): CircleShape => {
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
): RectangleShape => {
	const { sizes, options } = elSizesContext;
	const shapeSize = findElementSize(sizes, elType);

	if (shapeSize.type !== ElementShape.Rectangle) {
		throw new Error(`Expected element shape rectangle but received ${shapeSize.type}`);
	}

	return scaleRectangleShape(shapeSize, options.scale);
};

export const useCircleSizeScale = (circleShapeSize: CircleShape, scale: number) =>
	useMemo(() => scaleCircleShape(circleShapeSize, scale), [circleShapeSize, scale]);

export const useRectangleSizeScale = (rectangleShapeSize: RectangleShape, scale: number) =>
	useMemo(() => scaleRectangleShape(rectangleShapeSize, scale), [rectangleShapeSize, scale]);

export const calculateShapeSizeBoundingBox = (position: Point, shape: Shapes): BoundingBox => {
	if (shape.type === ElementShape.Circle) {
		const x = position.x + shape.radius / 2;
		const y = position.y + shape.radius / 2;
		return new BoundingBox(x, y, shape.radius, shape.radius);
	}

	if (shape.type === ElementShape.Rectangle) {
		return new BoundingBox(position.x, position.y, shape.width, shape.height);
	}

	throw new Error('Unsupported shape type received for bounding box creation');
};

export const sizesConfig = () => {
	return defaultSizeConfig;
};

