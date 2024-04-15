import deepMerge from 'deepmerge';
import { RootStore, useStore } from '../rootStore';
import { BoundingBox, ElementType, Point } from '../../model';
import {
	Theme,
	DrawerThemeOverride,
	findCircleShapeSize,
	findRectangleShapeSize,
	findElementSize,
	scaleCircleShape,
	scaleRectangleShape,
	calculateShapeSizeBoundingBox,
} from '../../theme';

export const selectElementSizeOptions = (state: RootStore) => state.elementSizes.options;

export const useThemeContext = (elType?: ElementType) =>
	useStore((state: RootStore) => {
		const elTheme = elType ? state.themes[elType] ?? {} : {};

		return deepMerge<Theme, DrawerThemeOverride>(state.themes.default, elTheme, {
			arrayMerge: (_destinationArray, sourceArray) => sourceArray,
		});
	});

export const useShapeSize = (type: ElementType) =>
	useStore((state: RootStore) => findElementSize(state.elementSizes, type));

export const useCircleShapeSize = (type: ElementType, scale = 1) =>
	useStore((state: RootStore) =>
		scaleCircleShape(findCircleShapeSize(state.elementSizes, type), scale),
	);

export const useRectangleShapeSize = (type: ElementType, scale = 1) =>
	useStore((state: RootStore) =>
		scaleRectangleShape(findRectangleShapeSize(state.elementSizes, type), scale),
	);

export const useBoundingBox = (type: ElementType | null, position: Point) =>
	useStore((state: RootStore) => {
		if (!type) {
			return BoundingBox.empty(position.x, position.y);
		}

		const shapeSize = findElementSize(state.elementSizes, type);
		return calculateShapeSizeBoundingBox(position, shapeSize);
	});

