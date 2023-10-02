import { Draft, createEntityAdapter, createSelector } from '@reduxjs/toolkit';
import {
	ConnectPointPosition,
	ConnectPointType,
	ConnectPointX,
	ConnectPoints,
	Element,
	ElementType,
	calcConnectPointVisibility,
} from '../../model';
import { StageSlice } from '../stageSlice';
import {
	ElementSizesContext,
	calculateShapeSizeBoundingBox,
	findCircleShapeSize,
	findElementSize,
} from '../../theme';
import { selectElementById } from '../elements';
import { RootState } from '../rootState';

export interface CreateElementConnectPointsPayload {
	elementId: string;
}

export interface CreateElementConnectPointsAction {
	type: string;
	payload: CreateElementConnectPointsPayload;
}

export interface MoveConnectPointsByDeltaPayload {
	id: string;
	dx: number;
	dy: number;
}

export interface MoveConnectPointsByDeltaAction {
	type: string;
	payload: MoveConnectPointsByDeltaPayload;
}

export interface RemoveConnectPointsPayload {
	elementIds: string[];
}

export interface RemoveConnectPointsAction {
	type: string;
	payload: RemoveConnectPointsPayload;
}

export interface ElementConnectPointsX {
	id: string;
	connectPoints: ConnectPointX[];
}

const connectPointsAdapter = createEntityAdapter<ElementConnectPointsX>({
	selectId: (cp) => cp.id,
});

export const {
	selectAll: selectAllConnectPoints,
	selectById: selectConnectPointById,
	selectEntities: selectConnectPointEntities,
} = connectPointsAdapter.getSelectors();

export const createConnectPointsAdapterInitialState = () => connectPointsAdapter.getInitialState();

const createConnectPoints = (
	element: Element,
	elSizesContext: ElementSizesContext,
): ConnectPointX[] => {
	const elShape = findElementSize(elSizesContext, element.type);
	const connectPointShape = findCircleShapeSize(elSizesContext, ElementType.ConnectPoint);

	const bb = calculateShapeSizeBoundingBox({ x: element.x, y: element.y }, elShape);
	const { inputVisible, eventsVisible, outputVisible } = calcConnectPointVisibility(
		element.type,
		element.properties,
	);

	const centerX = bb.center.x;
	const centerY = bb.center.y;

	const topX = centerX;
	const topY = bb.y;

	const rightX = bb.x + bb.width;
	const rightY = centerY;

	const bottomX = centerX;
	const bottomY = bb.y + bb.height;

	const leftX = bb.x;
	const leftY = centerY;

	return [
		{
			type: ConnectPointType.Input,
			visible: inputVisible,
			elementId: element.id,
			position: ConnectPointPosition.Left,
			x: leftX - connectPointShape.radius,
			y: leftY - connectPointShape.radius,
		},
		{
			type: ConnectPointType.Output,
			visible: outputVisible,
			elementId: element.id,
			position: ConnectPointPosition.Right,
			x: rightX - connectPointShape.radius,
			y: rightY - connectPointShape.radius,
		},
		{
			type: ConnectPointType.Event,
			visible: eventsVisible,
			elementId: element.id,
			position: ConnectPointPosition.Top,
			x: topX - connectPointShape.radius,
			y: topY - connectPointShape.radius,
		},
		{
			type: ConnectPointType.Event,
			visible: eventsVisible,
			elementId: element.id,
			position: ConnectPointPosition.Bottom,
			x: bottomX - connectPointShape.radius,
			y: bottomY - connectPointShape.radius,
		},
	];
};

export const createElementConnectPointsStateChange = (
	slice: Draft<StageSlice>,
	element: Element,
) => {
	const connectPoints = createConnectPoints(element, slice.elementSizes);
	slice.connectPoints = connectPointsAdapter.addOne(slice.connectPoints, {
		id: element.id,
		connectPoints,
	});
};

export const createElementsConnectPointsStateChange = (
	slice: Draft<StageSlice>,
	elements: Element[],
) => {
	const connectPoints = elements.map((element) => ({
		id: element.id,
		connectPoints: createConnectPoints(element, slice.elementSizes),
	}));
	slice.connectPoints = connectPointsAdapter.addMany(slice.connectPoints, connectPoints);
};

export const moveConnectPointsByDeltaStateChange = (
	slice: Draft<StageSlice>,
	payload: MoveConnectPointsByDeltaPayload,
) => {
	const elementConnectPoints = selectConnectPointById(slice.connectPoints, payload.id);
	if (!elementConnectPoints) {
		return;
	}

	slice.connectPoints = connectPointsAdapter.updateOne(slice.connectPoints, {
		id: payload.id,
		changes: {
			connectPoints: elementConnectPoints.connectPoints.map((cp) => ({
				...cp,
				x: cp.x + payload.dx,
				y: cp.y + payload.dy,
			})),
		},
	});
};

export const removeConnectPointsByIdsStateChange = (
	slice: Draft<StageSlice>,
	payload: RemoveConnectPointsPayload,
) => {
	slice.connectPoints = connectPointsAdapter.removeMany(slice.connectPoints, payload.elementIds);
};

export const connectPointsAdapterReducers = {
	createElementConnectPoints: (
		slice: Draft<StageSlice>,
		action: CreateElementConnectPointsAction,
	) => {
		const element = selectElementById(slice.elements, action.payload.elementId);
		if (!element) {
			throw new Error(`Element with ${action.payload.elementId} not found`);
		}

		createElementConnectPointsStateChange(slice, element);
	},
	moveConnectPointsByDelta: (slice: Draft<StageSlice>, action: MoveConnectPointsByDeltaAction) =>
		moveConnectPointsByDeltaStateChange(slice, action.payload),
	removeConnectPointsByIds: (slice: Draft<StageSlice>, action: RemoveConnectPointsAction) =>
		removeConnectPointsByIdsStateChange(slice, action.payload),
};

const globalConnectPointsSelector = connectPointsAdapter.getSelectors<RootState>(
	(state) => state.stage.connectPoints,
);

const selectConnectPointsById = (state: RootState, id: string) =>
	globalConnectPointsSelector.selectById(state, id)?.connectPoints ?? [];

const selectElementConnectPoints = createSelector(selectConnectPointsById, (connectPoints) =>
	connectPoints.reduce<ConnectPoints>(
		(connectPoints, cp) => ({
			...connectPoints,
			[cp.position]: cp,
		}),
		{},
	),
);
export const selectElementConnectPointsById = (id: string) => (state: RootState) =>
	selectElementConnectPoints(state, id);

