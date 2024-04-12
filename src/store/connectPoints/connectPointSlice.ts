import { StateCreator } from 'zustand';
import { RootState } from '../rootStateNew';
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
} from '../../model';
import { produce } from 'immer';
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
		set(
			produce<RootState>((state) => {
				const connectPoints = createConnectPoints(element, state.elementSizes);
				state.connectPoints[element.id] = connectPoints;
			}),
		),
	removeElementsConnectPoints: (elementIds: string[]) =>
		set(
			produce<RootState>((state) => {
				if (elementIds.length === 0) {
					return;
				}

				elementIds.forEach((elId) => {
					delete state.connectPoints[elId];
				});
			}),
		),
	setSelectElementConnectPoint: (elementId: string) =>
		set(
			produce<RootState>((state) => {
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
			}),
		),
	loadConnectPoints: (elements: Element[]) =>
		set(
			produce<RootState>((state) => {
				elements.forEach((element) => {
					state.connectPoints[element.id] = createConnectPoints(
						element,
						state.elementSizes,
					);
				});
			}),
		),
	clearSelectedConnectPoints: () =>
		set(
			produce<RootState>((state) => {
				Object.keys(state.connectPoints).forEach((elId) => {
					state.connectPoints[elId] = hideElementConnectPointsVisibility(
						state.connectPoints[elId],
					);
				});
			}),
		),
	setSelectElementsConnectPoints: (elementIds: string[]) =>
		set(
			produce<RootState>((state) => {
				Object.keys(state.connectPoints).forEach((elId) => {
					const connectPoints = state.connectPoints[elId];
					if (!elementIds.includes(elId)) {
						state.connectPoints[elId] =
							hideElementConnectPointsVisibility(connectPoints);
						return;
					}

					const el = state.elements[elId];
					if (!el) {
						throw new Error(`Element with id ${elId} was not found`);
					}

					state.connectPoints[elId] = calcElementConnectPointsVisibility(
						el,
						connectPoints,
					);
				});
			}),
		),
	markConnectionPointsAsConnectable: (elementIds: string[]) =>
		set(
			produce<RootState>((state) => {
				Object.keys(state.connectPoints).forEach((elId) => {
					state.connectPoints[elId] = elementIds.includes(elId)
						? elementConnectPointsAsConnectable(state.connectPoints[elId])
						: hideElementConnectPointsVisibility(state.connectPoints[elId]);
				});
			}),
		),
	selectConnectPoints: (elementId: string) =>
		set(
			produce<RootState>((state) => {
				const el = state.elements[elementId];
				if (!el) {
					throw new Error(`Element with id ${elementId} was not found`);
				}

				state.connectPoints[elementId] = calcElementConnectPointsVisibility(
					el,
					state.connectPoints[elementId],
				);
			}),
		),
	deselectConnectPoints: (elementId: string) =>
		set(
			produce<RootState>((state) => {
				state.connectPoints[elementId] = hideElementConnectPointsVisibility(
					state.connectPoints[elementId],
				);
			}),
		),
	clearHighlightConnectPoints: () =>
		set(
			produce<RootState>((state) => {
				Object.keys(state.connectPoints).forEach((elId) => {
					state.connectPoints[elId] = state.connectPoints[elId].map((cp) => ({
						...cp,
						highlight: false,
					}));
				});
			}),
		),
	moveConnectPointsByDelta: (payload: MoveConnectPointsByDeltaPayload) =>
		set(
			produce<RootState>((state) => {
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
			}),
		),
	lockConnectLine: (connectPointBoundingBox: IBoundingBox) =>
		set(
			produce<RootState>((state) => {
				if (!state.draftConnectLine) {
					return;
				}

				const lastPoint = state.draftConnectLine.points.at(-1);
				if (!lastPoint) {
					return;
				}

				const hasOverlap = pointOverlapBoundingBox(lastPoint, connectPointBoundingBox);

				if (!hasOverlap) {
					return;
				}

				lastPoint.x = connectPointBoundingBox.x + connectPointBoundingBox.width / 2;
				lastPoint.y = connectPointBoundingBox.y + connectPointBoundingBox.height / 2;
				state.draftConnectLine.locked = true;
			}),
		),
	unlockDraftConnectLine: () =>
		set(
			produce<RootState>((state) => {
				if (!state.draftConnectLine) {
					return;
				}

				state.draftConnectLine.locked = false;
			}),
		),
	updateConnectPoints: (payload: UpdateConnectPointsPayload) =>
		set(
			produce<RootState>((state) => {
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
			}),
		),
});

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

