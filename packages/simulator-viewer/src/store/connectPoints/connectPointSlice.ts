import { StateCreator } from 'zustand';
import {
	calcConnectPointVisibility,
	ConnectPoint,
	ConnectPointPosition,
	ConnectPoints,
	ConnectPointType,
	Element,
	ElementType,
	IBoundingBox,
	pointOverlapBoundingBox,
} from '@maklja/vision-simulator-model';
import { RootState } from '../rootStore';
import {
	calculateShapeSizeBoundingBox,
	ElementSizesContext,
	findCircleShapeSize,
	findElementSize,
} from '../../theme';
import { useShallow } from 'zustand/react/shallow';

export interface MoveConnectPointsByDeltaPayload {
	ids: string[];
	dx: number;
	dy: number;
}

export type ConnectPointTypeOption = {
	[key in ConnectPointType]?: boolean;
};

export type ConnectPointPositionOption = {
	[key in ConnectPointPosition]?: boolean;
};

export interface UpdateConnectPointsPayload {
	connectPointUpdates: {
		id: string;
		visibility?: ConnectPointTypeOption;
		highlight?: ConnectPointPositionOption;
	}[];
}

export interface ConnectPointSlice {
	connectPoints: Record<string, ConnectPoint[]>;
	createElementConnectPoints: (element: Element) => void;
	removeElementsConnectPoints: (elementIds: string[]) => void;
	setSelectElementConnectPoint: (elementId: string) => void;
	loadConnectPoints: (elements: Element[]) => void;
	clearSelectedConnectPoints: () => void;
	setSelectElementsConnectPoints: (elementIds: string[]) => void;
	selectConnectPoints: (elementId: string) => void;
	deselectConnectPoints: (elementId: string) => void;
	markConnectionPointsAsConnectable: (elementIds: string[]) => void;
	clearHighlightConnectPoints: () => void;
	moveConnectPointsByDelta: (payload: MoveConnectPointsByDeltaPayload) => void;
	lockConnectLine: (connectPointBoundingBox: IBoundingBox) => void;
	unlockDraftConnectLine: () => void;
	updateConnectPoints: (payload: UpdateConnectPointsPayload) => void;
}

function createConnectPoints(
	element: Element,
	elSizesContext: ElementSizesContext,
): ConnectPoint[] {
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
}

function calcElementConnectPointsVisibility(el: Element, connectPoints: ConnectPoint[]) {
	const { eventsVisible, outputVisible } = calcConnectPointVisibility(el.type, el.properties);
	return connectPoints.map((cp) => {
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

function hideElementConnectPointsVisibility(connectPoints: ConnectPoint[]) {
	return connectPoints.map((cp) => ({
		...cp,
		visible: false,
	}));
}

function elementConnectPointsAsConnectable(connectPoints: ConnectPoint[]) {
	return connectPoints.map((cp) => {
		if (cp.type === ConnectPointType.Input) {
			return {
				...cp,
				visible: true,
			};
		}

		return cp;
	});
}

export const createConnectPointSlice: StateCreator<RootState, [], [], ConnectPointSlice> = (
	set,
) => ({
	connectPoints: {},
	createElementConnectPoints: (element: Element) =>
		set((state) => {
			const connectPoints = createConnectPoints(element, state.elementSizes);
			state.connectPoints[element.id] = connectPoints;

			return state;
		}, true),
	removeElementsConnectPoints: (elementIds: string[]) =>
		set((state) => {
			if (elementIds.length === 0) {
				return state;
			}

			elementIds.forEach((elId) => {
				delete state.connectPoints[elId];
			});

			return state;
		}, true),
	setSelectElementConnectPoint: (elementId: string) =>
		set((state) => {
			const el = state.elements[elementId];
			if (!el) {
				throw new Error(`Element with id ${elementId} was not found`);
			}

			Object.keys(state.connectPoints).forEach((elId) => {
				const connectPoints = state.connectPoints[elId];
				state.connectPoints[elId] =
					elId !== elementId
						? hideElementConnectPointsVisibility(connectPoints)
						: calcElementConnectPointsVisibility(el, connectPoints);
			});

			return state;
		}, true),
	loadConnectPoints: (elements: Element[]) =>
		set((state) => {
			elements.forEach((element) => {
				state.connectPoints[element.id] = createConnectPoints(element, state.elementSizes);
			});

			return state;
		}, true),
	clearSelectedConnectPoints: () =>
		set((state) => {
			Object.keys(state.connectPoints).forEach((elId) => {
				state.connectPoints[elId] = hideElementConnectPointsVisibility(
					state.connectPoints[elId],
				);
			});

			return state;
		}, true),
	setSelectElementsConnectPoints: (elementIds: string[]) =>
		set((state) => {
			Object.keys(state.connectPoints).forEach((elId) => {
				const connectPoints = state.connectPoints[elId];
				if (!elementIds.includes(elId)) {
					state.connectPoints[elId] = hideElementConnectPointsVisibility(connectPoints);
					return;
				}

				const el = state.elements[elId];
				if (!el) {
					throw new Error(`Element with id ${elId} was not found`);
				}

				state.connectPoints[elId] = calcElementConnectPointsVisibility(el, connectPoints);
			});

			return state;
		}, true),
	markConnectionPointsAsConnectable: (elementIds: string[]) =>
		set((state) => {
			Object.keys(state.connectPoints).forEach((elId) => {
				state.connectPoints[elId] = elementIds.includes(elId)
					? elementConnectPointsAsConnectable(state.connectPoints[elId])
					: hideElementConnectPointsVisibility(state.connectPoints[elId]);
			});

			return state;
		}, true),
	selectConnectPoints: (elementId: string) =>
		set((state) => {
			const el = state.elements[elementId];
			if (!el) {
				throw new Error(`Element with id ${elementId} was not found`);
			}

			state.connectPoints[elementId] = calcElementConnectPointsVisibility(
				el,
				state.connectPoints[elementId],
			);

			return state;
		}, true),
	deselectConnectPoints: (elementId: string) =>
		set((state) => {
			state.connectPoints[elementId] = hideElementConnectPointsVisibility(
				state.connectPoints[elementId],
			);

			return state;
		}),
	clearHighlightConnectPoints: () =>
		set((state) => {
			Object.keys(state.connectPoints).forEach((elId) => {
				state.connectPoints[elId] = state.connectPoints[elId].map((cp) => ({
					...cp,
					highlight: false,
				}));
			});

			return state;
		}, true),
	moveConnectPointsByDelta: (payload: MoveConnectPointsByDeltaPayload) =>
		set((state) => moveConnectPointsByDelta(state, payload), true),
	lockConnectLine: (connectPointBoundingBox: IBoundingBox) =>
		set((state) => {
			if (!state.draftConnectLine) {
				return state;
			}

			const lastPoint = state.draftConnectLine.points.at(-1);
			if (!lastPoint) {
				return state;
			}

			const hasOverlap = pointOverlapBoundingBox(lastPoint, connectPointBoundingBox);

			if (!hasOverlap) {
				return state;
			}

			lastPoint.x = connectPointBoundingBox.x + connectPointBoundingBox.width / 2;
			lastPoint.y = connectPointBoundingBox.y + connectPointBoundingBox.height / 2;
			state.draftConnectLine.locked = true;

			return state;
		}, true),
	unlockDraftConnectLine: () =>
		set((state) => {
			if (!state.draftConnectLine) {
				return state;
			}

			state.draftConnectLine.locked = false;

			return state;
		}, true),
	updateConnectPoints: (payload: UpdateConnectPointsPayload) =>
		set((state) => {
			payload.connectPointUpdates.forEach((updatePayload) => {
				const elementConnectPoints = state.connectPoints[updatePayload.id];
				if (!elementConnectPoints) {
					throw new Error(
						`Failed to find connect points for element ${updatePayload.id}`,
					);
				}

				elementConnectPoints.forEach((cp) => {
					cp.visible = updatePayload.visibility?.[cp.type] ?? cp.visible;
					cp.highlight = updatePayload.highlight?.[cp.position] ?? cp.highlight;
				});
			});

			return state;
		}, true),
});

export function moveConnectPointsByDelta(
	state: RootState,
	payload: MoveConnectPointsByDeltaPayload,
) {
	payload.ids.forEach((elId) => {
		const elementConnectPoints = state.connectPoints[elId];
		if (!elementConnectPoints) {
			throw new Error(`Connect points not found for element ${elId}`);
		}

		state.connectPoints[elId] = elementConnectPoints.map((cp) => ({
			...cp,
			x: cp.x + payload.dx,
			y: cp.y + payload.dy,
		}));
	});

	return state;
}

export const selectElementConnectPointsById = (id: string) =>
	useShallow((state: RootState) => {
		const connectPoints = state.connectPoints[id] ?? [];
		return connectPoints.reduce<ConnectPoints>(
			(connectPoints, cp) => ({
				...connectPoints,
				[cp.position]: cp,
			}),
			{},
		);
	});
