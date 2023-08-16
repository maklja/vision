import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import deepMerge from 'deepmerge';
import { RootState } from '../rootState';
import { BoundingBox, ElementType, Point } from '../../model';
import {
	Theme,
	DrawerThemeOverride,
	findCircleShapeSize,
	CircleShapeSize,
	findRectangleShapeSize,
	RectangleShapeSize,
	ShapeSize,
	findElementSize,
	scaleCircleShape,
	scaleRectangleShape,
	scaleShapeSize,
	calculateShapeSizeBoundingBox,
} from '../../theme';

const selectThemes = (state: RootState) => state.stage.themes;

const selectElementType = (_state: RootState, elType?: ElementType) => elType;

const makeSelectThemeContext = () =>
	createSelector([selectThemes, selectElementType], (themes, elType) => {
		const elTheme = elType ? themes[elType] ?? {} : {};

		return deepMerge<Theme, DrawerThemeOverride>(themes.default, elTheme, {
			arrayMerge: (_destinationArray, sourceArray) => sourceArray,
		});
	});

export const useThemeContext = (type?: ElementType): Theme => {
	const selectThemeContext = useMemo(makeSelectThemeContext, []);
	return useSelector((state: RootState) => selectThemeContext(state, type));
};

export const useShapeSize = (type: ElementType, scale = 1): ShapeSize =>
	useSelector((state: RootState) =>
		scaleShapeSize(findElementSize(state.stage.elementSizes.sizes, type), scale),
	);

export const useCircleShapeSize = (type: ElementType, scale = 1): CircleShapeSize =>
	useSelector((state: RootState) =>
		scaleCircleShape(findCircleShapeSize(state.stage.elementSizes, type), scale),
	);

export const useRectangleShapeSize = (type: ElementType, scale = 1): RectangleShapeSize =>
	useSelector((state: RootState) =>
		scaleRectangleShape(findRectangleShapeSize(state.stage.elementSizes, type), scale),
	);

export const useBoundingBox = (
	type: ElementType | null,
	position: Point,
	scale = 1,
): BoundingBox => {
	return useSelector((state: RootState) => {
		if (!type) {
			return BoundingBox.empty(position.x, position.y);
		}

		const shapeSize = scaleShapeSize(
			findElementSize(state.stage.elementSizes.sizes, type),
			scale,
		);
		return calculateShapeSizeBoundingBox(position, shapeSize);
	});
};

