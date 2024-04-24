import { useShallow } from 'zustand/react/shallow';
import { RootState, useRootStore } from '../rootStore';
import { BoundingBox, ElementType, Point } from '../../model';
import {
	Theme,
	findCircleShapeSize,
	findRectangleShapeSize,
	findElementSize,
	scaleCircleShape,
	scaleRectangleShape,
	calculateShapeSizeBoundingBox,
} from '../../theme';

export const selectElementSizeOptions = (state: RootState) => state.elementSizes.options;

export const useThemeContext = (elType?: ElementType): Theme =>
	useRootStore(
		useShallow((state: RootState) => {
			if (!elType) {
				return state.themes.default;
			}

			return state.themes[elType] ?? state.themes.default;
		}),
	);

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

export const useBoundingBox = (elementId: string | null) =>
	useRootStore(
		useShallow((state: RootState) => {
			if (elementId == null) {
				return BoundingBox.empty();
			}

			const el = state.elements[elementId];
			if (!el) {
				return BoundingBox.empty();
			}

			const shapeSize = findElementSize(state.elementSizes, el.type);
			return calculateShapeSizeBoundingBox(el, shapeSize);
		}),
	);

export const useConnectPointBoundingBox = (position: Point = { x: 0, y: 0 }) =>
	useRootStore(
		useShallow((state: RootState) => {
			const shapeSize = findElementSize(state.elementSizes, ElementType.ConnectPoint);
			return calculateShapeSizeBoundingBox(position, shapeSize);
		}),
	);

