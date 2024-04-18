import deepMerge from 'deepmerge';
import { RootState, useRootStore } from '../rootStore';
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

export const selectElementSizeOptions = (state: RootState) => state.elementSizes.options;

export const useThemeContext = (elType?: ElementType) =>
	useRootStore((state: RootState) => {
		const elTheme = elType ? state.themes[elType] ?? {} : {};

		return deepMerge<Theme, DrawerThemeOverride>(state.themes.default, elTheme, {
			arrayMerge: (_destinationArray, sourceArray) => sourceArray,
		});
	});

export const useShapeSize = (type: ElementType) =>
	useRootStore((state: RootState) => findElementSize(state.elementSizes, type));

export const useCircleShapeSize = (type: ElementType, scale = 1) =>
	useRootStore((state: RootState) =>
		scaleCircleShape(findCircleShapeSize(state.elementSizes, type), scale),
	);

export const useRectangleShapeSize = (type: ElementType, scale = 1) =>
	useRootStore((state: RootState) =>
		scaleRectangleShape(findRectangleShapeSize(state.elementSizes, type), scale),
	);

export const useBoundingBox = (type: ElementType | null, position: Point) =>
	useRootStore((state: RootState) => {
		if (!type) {
			return BoundingBox.empty(position.x, position.y);
		}

		const shapeSize = findElementSize(state.elementSizes, type);
		return calculateShapeSizeBoundingBox(position, shapeSize);
	});

