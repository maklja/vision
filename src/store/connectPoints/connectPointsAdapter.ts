import { Draft, Update, createEntityAdapter, createSelector } from '@reduxjs/toolkit';
import {
	ConnectPointPosition,
	ConnectPointType,
	ConnectPoint,
	ConnectPoints,
	Element,
	ElementType,
	IBoundingBox,
	calcConnectPointVisibility,
	pointOverlapBoundingBox,
} from '../../model';
import { StageSlice } from '../stageSlice';
import {
	ElementSizesContext,
	calculateShapeSizeBoundingBox,
	findCircleShapeSize,
	findElementSize,
} from '../../theme';
import { selectElementById, selectSelectedElementById } from '../elements';
import { RootState } from '../rootState';
import {
	disposeDrawerAnimationStateChange,
	refreshDrawerAnimationStateChange,
} from '../drawerAnimations';
import { AnimationKey } from '../../animation';

export interface CreateElementConnectPointsPayload {
	elementId: string;
}

export interface CreateElementConnectPointsAction {
	type: string;
	payload: CreateElementConnectPointsPayload;
}

export interface ToggleConnectPointSelectionPayload {
	elementId: string;
}

export interface ToggleConnectPointSelectionAction {
	type: string;
	payload: ToggleConnectPointSelectionPayload;
}

export interface SelectConnectPointPayload {
	elementId: string;
}

export interface SelectConnectPointAction {
	type: string;
	payload: SelectConnectPointPayload;
}

export interface MoveConnectPointsByDeltaPayload {
	ids: string[];
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

export type ConnectPointTypeOption = {
	[key in ConnectPointType]?: boolean;
};

export type ConnectPointPositionOption = {
	[key in ConnectPointPosition]?: boolean;
};

export interface SetSelectionConnectPointsAction {
	type: string;
	payload: {
		elementIds: string[];
	};
}

export interface UpdateManyConnectPointsPayload {
	connectPointUpdates: {
		id: string;
		visibility?: ConnectPointTypeOption;
		highlight?: ConnectPointPositionOption;
	}[];
}

export interface UpdateManyConnectPointsAction {
	type: string;
	payload: UpdateManyConnectPointsPayload;
}

export interface PinConnectLineAction {
	type: string;
	payload: {
		elementId: string;
		connectPointId: string;
		connectPointBoundingBox: IBoundingBox;
	};
}

export interface UnpinConnectLineAction {
	type: string;
	payload: {
		drawerId: string;
		animationId: string | null;
	};
}

export interface HighlightConnectPointsAction {
	type: string;
	payload: { type: ConnectPointType; position: ConnectPointPosition; elementId: string }[];
}

export interface ElementConnectPoints {
	id: string;
	connectPoints: ConnectPoint[];
}

const connectPointsAdapter = createEntityAdapter<ElementConnectPoints>({
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
): ConnectPoint[] => {
	const elShape = findElementSize(elSizesContext, element.type);
	const connectPointShape = findCircleShapeSize(elSizesContext, ElementType.ConnectPoint);

	const bb = calculateShapeSizeBoundingBox({ x: element.x, y: element.y }, elShape);

	const centerX = bb.center.x;
	const centerY = bb.center.y;

	const topX = centerX;
	const topY = bb.y - elShape.margin;

	const rightX = bb.x + bb.width + elShape.margin;
	const rightY = centerY;

	const bottomX = centerX;
	const bottomY = bb.y + bb.height + elShape.margin;

	const leftX = bb.x - elShape.margin;
	const leftY = centerY;

	return [
		{
			type: ConnectPointType.Input,
			visible: false,
			highlight: false,
			elementId: element.id,
			position: ConnectPointPosition.Left,
			x: leftX - connectPointShape.radius,
			y: leftY - connectPointShape.radius,
		},
		{
			type: ConnectPointType.Output,
			visible: false,
			highlight: false,
			elementId: element.id,
			position: ConnectPointPosition.Right,
			x: rightX - connectPointShape.radius,
			y: rightY - connectPointShape.radius,
		},
		{
			type: ConnectPointType.Event,
			visible: false,
			highlight: false,
			elementId: element.id,
			position: ConnectPointPosition.Top,
			x: topX - connectPointShape.radius,
			y: topY - connectPointShape.radius,
		},
		{
			type: ConnectPointType.Event,
			visible: false,
			highlight: false,
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
	const connectPointEntities = selectConnectPointEntities(slice.connectPoints);
	const elConnectPointsUpdate: Update<ElementConnectPoints>[] = payload.ids.map((elId) => {
		const elementConnectPoints = connectPointEntities[elId];
		if (!elementConnectPoints) {
			throw new Error(`Connect points not found for element ${elId}`);
		}

		return {
			id: elId,
			changes: {
				connectPoints: elementConnectPoints.connectPoints.map((cp) => ({
					...cp,
					x: cp.x + payload.dx,
					y: cp.y + payload.dy,
				})),
			},
		};
	});

	slice.connectPoints = connectPointsAdapter.updateMany(
		slice.connectPoints,
		elConnectPointsUpdate,
	);
};

export const removeConnectPointsByIdsStateChange = (
	slice: Draft<StageSlice>,
	payload: RemoveConnectPointsPayload,
) => {
	slice.connectPoints = connectPointsAdapter.removeMany(slice.connectPoints, payload.elementIds);
};

function calcElementConnectPointsVisibility(el: Element, elConnectPoints: ElementConnectPoints) {
	const { eventsVisible, outputVisible } = calcConnectPointVisibility(el.type, el.properties);
	return elConnectPoints.connectPoints.map((cp) => {
		switch (cp.type) {
			case ConnectPointType.Event:
				return { ...cp, visible: eventsVisible };
			case ConnectPointType.Output:
				return { ...cp, visible: outputVisible };
			default:
				return cp;
		}
	});
}

export function selectConnectPointStateChange(
	slice: Draft<StageSlice>,
	payload: SelectConnectPointPayload,
) {
	const { elementId } = payload;
	const elementSelection = selectSelectedElementById(slice.selectedElements, elementId);
	// check if element that contains connect points is already selected
	if (elementSelection) {
		return;
	}

	const el = selectElementById(slice.elements, elementId);
	if (!el) {
		throw new Error(`Element with id ${elementId} was not found`);
	}

	const connectPoints = selectAllConnectPoints(slice.connectPoints);
	const connectPointsUpdate: Update<ElementConnectPoints>[] = connectPoints.map(
		(elConnectPoints) => {
			if (elConnectPoints.id !== elementId) {
				return {
					id: elConnectPoints.id,
					changes: {
						connectPoints: elConnectPoints.connectPoints.map((cp) => ({
							...cp,
							visible: false,
						})),
					},
				};
			}

			return {
				id: elConnectPoints.id,
				changes: {
					connectPoints: calcElementConnectPointsVisibility(el, elConnectPoints),
				},
			};
		},
	);

	slice.connectPoints = connectPointsAdapter.updateMany(slice.connectPoints, connectPointsUpdate);
}

export function toggleSelectionConnectPointStateChange(
	slice: Draft<StageSlice>,
	payload: ToggleConnectPointSelectionPayload,
) {
	const { elementId } = payload;
	const el = selectElementById(slice.elements, elementId);
	if (!el) {
		throw new Error(`Element with id ${elementId} was not found`);
	}

	const elConnectPoints = selectConnectPointById(slice.connectPoints, elementId);
	if (!elConnectPoints) {
		throw new Error(`Connect points not found for element ${elementId}`);
	}

	const elementSelection = selectSelectedElementById(slice.selectedElements, elementId);
	if (elementSelection) {
		const updateConnectPoints = {
			id: elementId,
			changes: {
				connectPoints: calcElementConnectPointsVisibility(el, elConnectPoints),
			},
		};
		slice.connectPoints = connectPointsAdapter.updateOne(
			slice.connectPoints,
			updateConnectPoints,
		);
	} else {
		slice.connectPoints = connectPointsAdapter.updateOne(slice.connectPoints, {
			id: elementId,
			changes: {
				connectPoints: elConnectPoints.connectPoints.map((cp) => ({
					...cp,
					visible: false,
				})),
			},
		});
	}
}

export const setSelectionConnectPointsStateChange = (
	slice: Draft<StageSlice>,
	elementIds: string[],
) => {
	const connectPointsSelected = elementIds.map((elementId) => {
		const el = selectElementById(slice.elements, elementId);
		if (!el) {
			throw new Error(`Element with id ${elementId} was not found`);
		}

		const elConnectPoints = selectConnectPointById(slice.connectPoints, elementId);
		if (!elConnectPoints) {
			throw new Error(`Connect points not found for element ${elementId}`);
		}

		return {
			id: elementId,
			changes: {
				connectPoints: calcElementConnectPointsVisibility(el, elConnectPoints),
			},
		};
	});

	slice.connectPoints = connectPointsAdapter.updateMany(
		slice.connectPoints,
		connectPointsSelected,
	);
};

export const updateManyConnectPointsStateChange = (
	slice: Draft<StageSlice>,
	payload: UpdateManyConnectPointsPayload,
) => {
	const { connectPointUpdates } = payload;
	const adapterUpdates = connectPointUpdates.map((updatePayload) => {
		const elementConnectPoints = selectConnectPointById(slice.connectPoints, updatePayload.id);
		if (!elementConnectPoints) {
			throw new Error(`Failed to find connect points for element ${updatePayload.id}`);
		}

		return {
			id: elementConnectPoints.id,
			changes: {
				connectPoints: elementConnectPoints.connectPoints.map((cp) => ({
					...cp,
					visible: updatePayload.visibility?.[cp.type] ?? cp.visible ?? false,
					highlight: updatePayload.highlight?.[cp.position] ?? cp.highlight ?? false,
				})),
			},
		};
	});

	slice.connectPoints = connectPointsAdapter.updateMany(slice.connectPoints, adapterUpdates);
};

export const clearSelectionConnectPointsStateChange = (slice: Draft<StageSlice>) => {
	const connectPoints = selectAllConnectPoints(slice.connectPoints);

	slice.connectPoints = connectPointsAdapter.updateMany(
		slice.connectPoints,
		connectPoints.map((elementConnectPoint) => ({
			id: elementConnectPoint.id,
			changes: {
				connectPoints: elementConnectPoint.connectPoints.map((cp) => ({
					...cp,
					visible: false,
				})),
			},
		})),
	);
};

export const clearHighlightConnectPointsStateChange = (slice: Draft<StageSlice>) => {
	const connectPoints = selectAllConnectPoints(slice.connectPoints);

	slice.connectPoints = connectPointsAdapter.updateMany(
		slice.connectPoints,
		connectPoints.map((elementConnectPoint) => ({
			id: elementConnectPoint.id,
			changes: {
				connectPoints: elementConnectPoint.connectPoints.map((cp) => ({
					...cp,
					highlight: false,
				})),
			},
		})),
	);
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
	setSelectionConnectPoints: (
		slice: Draft<StageSlice>,
		action: SetSelectionConnectPointsAction,
	) => setSelectionConnectPointsStateChange(slice, action.payload.elementIds),
	toggleSelectionConnectPoint: (
		slice: Draft<StageSlice>,
		action: ToggleConnectPointSelectionAction,
	) => toggleSelectionConnectPointStateChange(slice, action.payload),
	selectConnectPoint: (slice: Draft<StageSlice>, action: SelectConnectPointAction) =>
		selectConnectPointStateChange(slice, action.payload),
	updateManyConnectPoints: (slice: Draft<StageSlice>, action: UpdateManyConnectPointsAction) =>
		updateManyConnectPointsStateChange(slice, action.payload),
	clearHighlighConnectPoints: (slice: Draft<StageSlice>) =>
		clearHighlightConnectPointsStateChange(slice),
	pinConnectLine: (slice: Draft<StageSlice>, action: PinConnectLineAction) => {
		if (!slice.draftConnectLine) {
			return;
		}

		const lastPoint = slice.draftConnectLine.points.at(-1);
		if (!lastPoint) {
			return;
		}

		const { connectPointBoundingBox } = action.payload;
		const hasOverlap = pointOverlapBoundingBox(lastPoint, connectPointBoundingBox);

		if (!hasOverlap) {
			return;
		}

		lastPoint.x = connectPointBoundingBox.x + connectPointBoundingBox.width / 2;
		lastPoint.y = connectPointBoundingBox.y + connectPointBoundingBox.height / 2;
		slice.draftConnectLine.locked = true;

		refreshDrawerAnimationStateChange(slice, {
			drawerId: action.payload.connectPointId,
			key: AnimationKey.SnapConnectPoint,
		});
	},
	unpinConnectLine: (slice: Draft<StageSlice>, action: UnpinConnectLineAction) => {
		if (!slice.draftConnectLine) {
			return;
		}

		slice.draftConnectLine.locked = false;

		if (!action.payload.animationId) {
			return;
		}

		disposeDrawerAnimationStateChange(slice, {
			drawerId: action.payload.drawerId,
			animationId: action.payload.animationId,
		});
	},
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

