import { StateCreator } from 'zustand';
import { RootState } from '../rootStore';
import {
	ConnectedElement,
	ConnectLine,
	ConnectPointPosition,
	ConnectPointType,
	distanceBetweenPoints,
	Point,
} from '../../model';
import { StageState, StartConnectLineDrawPayload } from '../stage';
import { v1 } from 'uuid';
import { useShallow } from 'zustand/react/shallow';

export interface DraftConnectLine {
	id: string;
	source: ConnectedElement;
	points: Point[];
	locked: boolean;
	index: number;
	name: string;
}

export interface LinkConnectLineDrawPayload {
	connectPointId: string;
	targetId: string;
	targetPoint: Point;
	targetConnectPointType: ConnectPointType;
	targetConnectPointPosition: ConnectPointPosition;
}

export interface MoveConnectLineDrawPayload {
	position: Point;
	normalizePosition: boolean;
}

export interface MoveConnectLinePointPayload {
	id: string;
	index: number;
	x: number;
	y: number;
	normalizePosition: boolean;
}

export interface MoveConnectLinePointsByDeltaPayload {
	id: string;
	pointIndexes: number[];
	dx: number;
	dy: number;
}

export interface RemoveElementConnectLinesPayload {
	elementId: string;
	connectPointType?: ConnectPointType;
}

export interface UpdateConnectLinePayload {
	id: string;
	index?: number;
	name?: string;
}

export interface ConnectLineSlice {
	connectLines: Record<string, ConnectLine>;
	selectedConnectLines: string[];
	draftConnectLine: DraftConnectLine | null;
	createConnectLineDraw: (payload: StartConnectLineDrawPayload) => void;
	moveConnectLineDraw: (payload: MoveConnectLineDrawPayload) => void;
	addNextPointToConnectLineDraw: (point: Point) => void;
	deleteConnectLineDraw: () => void;
	removeConnectLines: (connectLineIds: string[]) => void;
	addConnectLineDraw: (payload: LinkConnectLineDrawPayload) => void;
	selectConnectLines: (connectLineIds: string[]) => void;
	deselectAllConnectLines: () => void;
	movePointConnectLine: (payload: MoveConnectLinePointPayload) => void;
	moveConnectLinePointsByDelta: (payload: MoveConnectLinePointsByDeltaPayload) => void;
	removeElementConnectLines: (payload: RemoveElementConnectLinesPayload) => void;
	updateConnectLine: (payload: UpdateConnectLinePayload) => void;
	loadConnectLines: (connectLInes: ConnectLine[]) => void;
}

function generateUniqueName(name: string, takenNames: string[]) {
	let uniqueName = name;
	let i = 0;
	while (takenNames.includes(uniqueName)) {
		uniqueName = `${uniqueName}_${++i}`;
	}

	return uniqueName;
}

export const createConnectLineSlice: StateCreator<RootState, [], [], ConnectLineSlice> = (set) => ({
	connectLines: {},
	selectedConnectLines: [],
	draftConnectLine: null,
	createConnectLineDraw: (payload: StartConnectLineDrawPayload) =>
		set((state) => {
			const { sourceId, points, type, position } = payload;
			const connectLines = Object.values(state.connectLines);
			const clsNames = connectLines
				.filter(({ source }) => source.id === sourceId && source.connectPointType === type)
				.map((cl) => cl.name);
			state.draftConnectLine = {
				id: v1(),
				name: generateUniqueName(`${type}_${position}`, clsNames),
				index: clsNames.length + 1,
				source: {
					id: sourceId,
					connectPointType: type,
					connectPosition: position,
				},
				points,
				locked: false,
			};

			return state;
		}),
	deleteConnectLineDraw: () =>
		set((state) => {
			state.draftConnectLine = null;
			return state;
		}),
	moveConnectLineDraw: (payload: MoveConnectLineDrawPayload) =>
		set((state) => {
			if (state.state !== StageState.DrawConnectLine || !state.draftConnectLine) {
				return state;
			}

			const { draftConnectLine } = state;
			if (draftConnectLine.locked) {
				return state;
			}

			const { position, normalizePosition } = payload;
			if (!normalizePosition) {
				draftConnectLine.points.splice(-1, 1, position);
				return state;
			}

			const lastPoint = draftConnectLine.points[draftConnectLine.points.length - 2];
			const newPosition =
				Math.abs(lastPoint.x - position.x) < Math.abs(lastPoint.y - position.y)
					? { x: lastPoint.x, y: position.y }
					: { x: position.x, y: lastPoint.y };

			draftConnectLine.points.splice(-1, 1, newPosition);
			return state;
		}, true),
	addNextPointToConnectLineDraw: (point: Point) =>
		set((state) => {
			if (!state.draftConnectLine) {
				return state;
			}

			state.draftConnectLine.points.push(point);
			return state;
		}),
	removeConnectLines: (connectLineIds: string[]) =>
		set((state) => {
			if (connectLineIds.length === 0) {
				return state;
			}

			connectLineIds.forEach((clId) => {
				delete state.connectLines[clId];
			});
			return state;
		}),
	addConnectLineDraw: (payload: LinkConnectLineDrawPayload) =>
		set((state) => {
			const el = state.elements[payload.targetId];
			if (!el || !state.draftConnectLine) {
				return state;
			}

			const clId = v1();
			state.connectLines[clId] = {
				id: clId,
				index: state.draftConnectLine.index,
				name: state.draftConnectLine.name,
				locked: false,
				points: [...state.draftConnectLine.points, payload.targetPoint],
				source: state.draftConnectLine.source,
				target: {
					id: el.id,
					connectPointType: payload.targetConnectPointType,
					connectPosition: payload.targetConnectPointPosition,
				},
			};
			return state;
		}),
	selectConnectLines: (connectLineIds: string[]) =>
		set((state) => {
			state.selectedConnectLines = connectLineIds;
			return state;
		}),
	deselectAllConnectLines: () =>
		set((state) => {
			state.selectedConnectLines = [];
			return state;
		}),
	movePointConnectLine: (payload: MoveConnectLinePointPayload) =>
		set((state) => {
			const cl = state.connectLines[payload.id];
			if (!cl) {
				return state;
			}

			const mousePosition = { x: payload.x, y: payload.y };
			if (!payload.normalizePosition) {
				cl.points = cl.points.map((p, i) => (i !== payload.index ? p : mousePosition));
				return state;
			}

			const prevPoint = cl.points[payload.index - 1];
			const nextPoint = cl.points[payload.index + 1];

			// random to force canvas redraw
			const rnd = Math.random() * 0.1;

			const newPoint1 = {
				x: prevPoint.x + rnd,
				y: nextPoint.y + rnd,
			};
			const newPoint2 = {
				x: nextPoint.x + rnd,
				y: prevPoint.y + rnd,
			};

			const normalizedPoint =
				distanceBetweenPoints(mousePosition, newPoint1) <
				distanceBetweenPoints(mousePosition, newPoint2)
					? newPoint1
					: newPoint2;

			cl.points = cl.points.map((p, i) => (i !== payload.index ? p : normalizedPoint));
			return state;
		}),
	moveConnectLinePointsByDelta: (payload: MoveConnectLinePointsByDeltaPayload) =>
		set((state) => moveConnectLinePointsByDelta(state, payload), true),
	removeElementConnectLines: (payload: RemoveElementConnectLinesPayload) =>
		set((state) => {
			const { elementId, connectPointType } = payload;
			const connectLines = Object.values(state.connectLines);
			const elConnectLines = connectLines.filter(
				({ source, target }) => source.id === elementId || target.id === elementId,
			);

			if (!connectPointType) {
				elConnectLines.forEach((cl) => {
					delete state.connectLines[cl.id];
				});
				return state;
			}

			elConnectLines
				.filter(
					({ source, target }) =>
						source.connectPointType === connectPointType ||
						target.connectPointType === connectPointType,
				)
				.forEach((cl) => {
					delete state.connectLines[cl.id];
				});
			return state;
		}),
	updateConnectLine: (payload: UpdateConnectLinePayload) =>
		set((state) => {
			const cl = state.connectLines[payload.id];
			if (!cl) {
				return state;
			}

			const changes = Object.fromEntries(
				Object.entries({
					index: payload.index,
					name: payload.name,
				}).filter(([, value]) => value !== undefined),
			);

			state.connectLines[payload.id] = {
				...cl,
				...changes,
			};
			return state;
		}),
	loadConnectLines: (connectLines: ConnectLine[]) =>
		set((state) => {
			state.connectLines = connectLines.reduce(
				(connectLinesStore, cl) => ({
					...connectLinesStore,
					[cl.id]: cl,
				}),
				{},
			);

			return state;
		}),
});

export function moveConnectLinePointsByDelta(
	state: RootState,
	payload: MoveConnectLinePointsByDeltaPayload,
) {
	const cl = state.connectLines[payload.id];
	if (!cl) {
		return state;
	}

	payload.pointIndexes
		.filter((index) => index >= 0 && index < cl.points.length)
		.forEach((pointIndex) => {
			const p = cl.points[pointIndex];
			p.x += payload.dx;
			p.y += payload.dy;
		});

	return state;
}

export const selectStageDraftConnectLine = () => (state: RootState) => state.draftConnectLine;

export const selectStageConnectLines = () =>
	useShallow((state: RootState) => Object.values(state.connectLines));

export const selectRelatedElementElements = (elementId: string) => (state: RootState) => {
	const sourceConnectLines = Object.values(state.connectLines).filter(
		(cl) => cl.source.id === elementId,
	);

	return sourceConnectLines.map((connectLine) => {
		const element = state.elements[connectLine.target.id];
		if (!element) {
			throw new Error(`Element with id ${connectLine.target.id} not found`);
		}

		return {
			element,
			connectLine,
		};
	});
};

