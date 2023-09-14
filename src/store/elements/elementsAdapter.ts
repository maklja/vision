import { Draft, createEntityAdapter } from '@reduxjs/toolkit';
import { StageSlice } from '../stageSlice';
import { Element, ElementProps, Point } from '../../model';
import { RootState } from '../rootState';
import { moveConnectLinePointsByDeltaStateChange, selectAllConnectLines } from '../connectLines';
import { StageState, updateStateChange } from '../stage';
import { calculateShapeSizeBoundingBox, findElementSize, scaleShapeSize } from '../../theme';

export interface UpdateElementPayload<P = ElementProps> {
	id: string;
	visible?: boolean;
	scale?: number;
	properties?: P;
}

export interface UpdateElementAction<P = ElementProps> {
	type: string;
	payload: UpdateElementPayload<P>;
}

export interface MoveElementPayload {
	id: string;
	x: number;
	y: number;
}

export interface MoveElementAction {
	type: string;
	payload: MoveElementPayload;
}

export interface CreateDraftElementAction {
	type: string;
	payload: Element;
}

export interface AddDraftElementAction {
	type: string;
	payload: Element;
}

export interface RemoveElementsPayload {
	elementIds: string[];
}

export interface RemoveElementsAction {
	type: string;
	payload: RemoveElementsPayload;
}

export interface UpdateElementPropertyPayload {
	id: string;
	propertyName: string;
	propertyValue: unknown;
}

export interface UpdateElementPropertyAction {
	type: string;
	payload: UpdateElementPropertyPayload;
}

const elementsAdapter = createEntityAdapter<Element>({
	selectId: (el) => el.id,
});

export const createElementsAdapterInitialState = (elements: Element[] = []) =>
	elementsAdapter.addMany(elementsAdapter.getInitialState(), elements);

export const {
	selectAll: selectAllElements,
	selectById: selectElementById,
	selectEntities: selectElementEntities,
} = elementsAdapter.getSelectors();

export const updateElementStateChange = (
	slice: Draft<StageSlice>,
	payload: UpdateElementPayload,
) => {
	slice.elements = elementsAdapter.updateOne(slice.elements, {
		id: payload.id,
		changes: payload,
	});
};

enum SnapLineOrientation {
	Vertical = 0,
	Horizontal = 1,
}

interface SnapLine {
	points: [Point, Point];
	distance: number;
	orientation: SnapLineOrientation;
}

export const moveElementStateChange = (slice: Draft<StageSlice>, payload: MoveElementPayload) => {
	const el = selectElementById(slice.elements, payload.id);
	if (!el) {
		return;
	}

	slice.elements = elementsAdapter.updateOne(slice.elements, {
		id: payload.id,
		changes: payload,
	});

	const dx = payload.x - el.x;
	const dy = payload.y - el.y;

	const connectLines = selectAllConnectLines(slice.connectLines);
	connectLines.forEach((cl) => {
		if (cl.source.id === el.id) {
			moveConnectLinePointsByDeltaStateChange(slice, {
				id: cl.id,
				pointIndexes: [0, 1],
				dx,
				dy,
			});
		}

		if (cl.target.id === el.id) {
			moveConnectLinePointsByDeltaStateChange(slice, {
				id: cl.id,
				pointIndexes: [cl.points.length - 2, cl.points.length - 1],
				dx,
				dy,
			});
		}
	});

	const elements = selectAllElements(slice.elements).filter(
		(currentElement) => currentElement.id !== el.id,
	);

	const shapeSize = scaleShapeSize(findElementSize(slice.elementSizes.sizes, el.type), el.scale);
	const elBoundingBox = calculateShapeSizeBoundingBox({ x: el.x, y: el.y }, shapeSize);
	const elementsBoundingBox = elements.map((el) => {
		const shapeSize = scaleShapeSize(
			findElementSize(slice.elementSizes.sizes, el.type),
			el.scale,
		);
		return calculateShapeSizeBoundingBox({ x: el.x, y: el.y }, shapeSize);
	});
	const distances = elementsBoundingBox
		.flatMap((boundingBox) => {
			const { topLeft, topRight, bottomLeft, center } = boundingBox;
			const xMinHorizontal = Math.min(topLeft.x, elBoundingBox.topLeft.x);
			const xMaxHorizontal = Math.max(topRight.x, elBoundingBox.topRight.x);
			const topToTop: SnapLine = {
				points: [
					{
						x: xMinHorizontal,
						y: topLeft.y,
					},
					{
						x: xMaxHorizontal,
						y: topLeft.y,
					},
				],
				distance: Math.abs(topLeft.y - elBoundingBox.topLeft.y),
				orientation: SnapLineOrientation.Horizontal,
			};
			const topToMiddle: SnapLine = {
				points: [
					{
						x: xMinHorizontal,
						y: center.y,
					},
					{
						x: xMaxHorizontal,
						y: center.y,
					},
				],
				distance: Math.abs(center.y - elBoundingBox.topLeft.y),
				orientation: SnapLineOrientation.Horizontal,
			};
			const topToBottom: SnapLine = {
				points: [
					{
						x: xMinHorizontal,
						y: bottomLeft.y,
					},
					{
						x: xMaxHorizontal,
						y: bottomLeft.y,
					},
				],
				distance: Math.abs(bottomLeft.y - elBoundingBox.topLeft.y),
				orientation: SnapLineOrientation.Horizontal,
			};

			const bottomToTop: SnapLine = {
				points: [
					{
						x: xMinHorizontal,
						y: topLeft.y,
					},
					{
						x: xMaxHorizontal,
						y: topLeft.y,
					},
				],
				distance: Math.abs(topLeft.y - elBoundingBox.bottomLeft.y),
				orientation: SnapLineOrientation.Horizontal,
			};
			const bottomToMiddle: SnapLine = {
				points: [
					{
						x: xMinHorizontal,
						y: center.y,
					},
					{
						x: xMaxHorizontal,
						y: center.y,
					},
				],
				distance: Math.abs(center.y - elBoundingBox.bottomLeft.y),
				orientation: SnapLineOrientation.Horizontal,
			};
			const bottomToBottom: SnapLine = {
				points: [
					{
						x: xMinHorizontal,
						y: bottomLeft.y,
					},
					{
						x: xMaxHorizontal,
						y: bottomLeft.y,
					},
				],
				distance: Math.abs(bottomLeft.y - elBoundingBox.bottomLeft.y),
				orientation: SnapLineOrientation.Horizontal,
			};

			const yMinVertical = Math.min(topLeft.y, elBoundingBox.topLeft.y);
			const yMaxVertical = Math.max(bottomLeft.y, elBoundingBox.bottomLeft.y);
			const leftToLeft: SnapLine = {
				points: [
					{
						x: topLeft.x,
						y: yMinVertical,
					},
					{
						x: topLeft.x,
						y: yMaxVertical,
					},
				],
				distance: Math.abs(topLeft.x - elBoundingBox.topLeft.x),
				orientation: SnapLineOrientation.Vertical,
			};
			const leftToMiddle: SnapLine = {
				points: [
					{
						x: center.x,
						y: yMinVertical,
					},
					{
						x: center.x,
						y: yMaxVertical,
					},
				],
				distance: Math.abs(center.x - elBoundingBox.topLeft.x),
				orientation: SnapLineOrientation.Vertical,
			};
			const leftToRight: SnapLine = {
				points: [
					{
						x: topRight.x,
						y: yMinVertical,
					},
					{
						x: topRight.x,
						y: yMaxVertical,
					},
				],
				distance: Math.abs(topRight.x - elBoundingBox.topLeft.x),
				orientation: SnapLineOrientation.Vertical,
			};

			const rightToLeft: SnapLine = {
				points: [
					{
						x: topLeft.x,
						y: yMinVertical,
					},
					{
						x: topLeft.x,
						y: yMaxVertical,
					},
				],
				distance: Math.abs(topLeft.x - elBoundingBox.topRight.x),
				orientation: SnapLineOrientation.Vertical,
			};
			const rightToMiddle: SnapLine = {
				points: [
					{
						x: center.x,
						y: yMinVertical,
					},
					{
						x: center.x,
						y: yMaxVertical,
					},
				],
				distance: Math.abs(center.x - elBoundingBox.topRight.x),
				orientation: SnapLineOrientation.Vertical,
			};
			const rightToRight: SnapLine = {
				points: [
					{
						x: topRight.x,
						y: yMinVertical,
					},
					{
						x: topRight.x,
						y: yMaxVertical,
					},
				],
				distance: Math.abs(topRight.x - elBoundingBox.topRight.x),
				orientation: SnapLineOrientation.Vertical,
			};

			return [
				topToTop,
				topToMiddle,
				topToBottom,
				bottomToTop,
				bottomToMiddle,
				bottomToBottom,
				leftToLeft,
				leftToMiddle,
				leftToRight,
				rightToLeft,
				rightToMiddle,
				rightToRight,
			];
		})
		.filter((snapLine) => snapLine.distance < 6);

	console.log(distances);
};

export const removeElementsStateChange = (
	slice: Draft<StageSlice>,
	payload: RemoveElementsPayload,
) => {
	if (payload.elementIds.length === 0) {
		return;
	}

	slice.elements = elementsAdapter.removeMany(slice.elements, payload.elementIds);
};

export const updateElementPropertyStateChange = (
	slice: Draft<StageSlice>,
	payload: UpdateElementPropertyPayload,
) => {
	const element = selectElementById(slice.elements, payload.id);
	if (!element) {
		return;
	}

	slice.elements = elementsAdapter.updateOne(slice.elements, {
		id: element.id,
		changes: {
			properties: {
				...element.properties,
				[payload.propertyName]: payload.propertyValue,
			},
		},
	});
};

export const elementsAdapterReducers = {
	updateElement: (slice: Draft<StageSlice>, action: UpdateElementAction) =>
		updateElementStateChange(slice, action.payload),
	moveElement: (slice: Draft<StageSlice>, action: MoveElementAction) =>
		moveElementStateChange(slice, action.payload),
	removeElements: (slice: Draft<StageSlice>, action: RemoveElementsAction) =>
		removeElementsStateChange(slice, action.payload),
	updateElementProperty: (slice: Draft<StageSlice>, action: UpdateElementPropertyAction) =>
		updateElementPropertyStateChange(slice, action.payload),
	createDraftElement: (slice: Draft<StageSlice>, action: CreateDraftElementAction) => {
		updateStateChange(slice, StageState.DrawElement);
		slice.draftElement = action.payload;
	},
	addDraftElement: (slice: Draft<StageSlice>, action: AddDraftElementAction) => {
		updateStateChange(slice, StageState.Select);

		if (!slice.draftElement) {
			return;
		}

		slice.elements = elementsAdapter.addOne(slice.elements, action.payload);
		slice.draftElement = null;
	},
	clearDraftElement: (slice: Draft<StageSlice>) => {
		updateStateChange(slice, StageState.Select);
		slice.draftElement = null;
	},
};

const globalElementsSelector = elementsAdapter.getSelectors<RootState>(
	(state) => state.stage.elements,
);

export const selectStageElements = (state: RootState) => globalElementsSelector.selectAll(state);

export const selectStageElementById = (id: string | null) => (state: RootState) =>
	!id ? null : globalElementsSelector.selectById(state, id) ?? null;

export const selectStageDraftElement = (state: RootState) => state.stage.draftElement;
