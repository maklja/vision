import { Draft, createEntityAdapter } from '@reduxjs/toolkit';
import { StageSlice } from '../stageSlice';
import {
	ConnectLine,
	ConnectPointPosition,
	ConnectPointType,
	ConnectedElement,
	Element,
	ElementDescriptor,
	Point,
	distanceBetweenPoints,
	findElementDescriptor,
} from '../../model';
import { RootState } from '../rootState';
import { v1 } from 'uuid';
import {
	SelectedElement,
	selectAllElements,
	selectElementById,
	selectElementsStateChange,
} from '../elements';
import { StageState } from '../stage';
import {
	clearHighlightConnectPointsStateChange,
	clearSelectionConnectPointsStateChange,
	setSelectionConnectPointsStateChange,
	updateManyConnectPointsStateChange,
} from '../connectPoints';
import { removeAllDrawerAnimationStateChange } from '../drawerAnimations';

export interface DraftConnectLine {
	id: string;
	source: ConnectedElement;
	points: Point[];
	locked: boolean;
}

export interface StartConnectLineDrawPayload {
	sourceId: string;
	type: ConnectPointType;
	position: ConnectPointPosition;
	points: Point[];
}

export interface StartConnectLineDrawAction {
	type: string;
	payload: StartConnectLineDrawPayload;
}

export interface MoveConnectLineDrawAction {
	type: string;
	payload: {
		position: Point;
		normalizePosition: boolean;
	};
}

export interface AddPointConnectLineDrawAction {
	type: string;
	payload: Point;
}

export interface LinkConnectLineDrawPayload {
	connectPointId: string;
	targetId: string;
	targetPoint: Point;
	targetConnectPointType: ConnectPointType;
	targetConnectPointPosition: ConnectPointPosition;
}

export interface LinkConnectLineDrawAction {
	type: string;
	payload: LinkConnectLineDrawPayload;
}

export interface MoveConnectLinePointsByDeltaPayload {
	id: string;
	pointIndexes: number[];
	dx: number;
	dy: number;
}

export interface MoveConnectLinePointsByDeltaAction {
	type: string;
	payload: MoveConnectLinePointsByDeltaPayload;
}

export interface RemoveConnectLinesPayload {
	connectLineIds: string[];
}

export interface RemoveConnectLinesAction {
	type: string;
	payload: RemoveConnectLinesPayload;
}

export interface RemoveElementConnectLinesAction {
	type: string;
	payload: {
		elementId: string;
		connectPointType?: ConnectPointType;
	};
}

export interface MoveConnectLinePointAction {
	type: string;
	payload: {
		id: string;
		index: number;
		x: number;
		y: number;
		normalizePosition: boolean;
	};
}

const getConnectPointDescriptor = (
	el: Element,
	cpType: ConnectPointType,
	connectLines: ConnectLine[],
) => {
	const elDescriptor: ElementDescriptor = findElementDescriptor(el.type, el.properties);

	const elConnectTypeCardinality = connectLines.reduce((cardinality, cl) => {
		if (cl.source.id !== el.id || cl.source.connectPointType !== cpType) {
			return cardinality;
		}

		return cardinality + 1;
	}, 0);

	const cpDescriptor = elDescriptor[cpType] ?? { cardinality: 0, allowedTypes: new Set() };
	return {
		cardinalityExcited: elConnectTypeCardinality >= cpDescriptor.cardinality,
		allowedTypes: cpDescriptor.allowedTypes,
	};
};

const connectLinesAdapter = createEntityAdapter<ConnectLine>({
	selectId: (el) => el.id,
});

export const removeConnectLinesStateChange = (
	slice: Draft<StageSlice>,
	payload: RemoveConnectLinesPayload,
) => {
	if (payload.connectLineIds.length === 0) {
		return;
	}

	slice.connectLines = connectLinesAdapter.removeMany(slice.connectLines, payload.connectLineIds);
};

export const { selectAll: selectAllConnectLines, selectById: selectConnectLineById } =
	connectLinesAdapter.getSelectors();

export const createConnectLinesAdapterInitialState = () => connectLinesAdapter.getInitialState();

export const startConnectLineDrawStateChange = (
	slice: Draft<StageSlice>,
	payload: StartConnectLineDrawPayload,
) => {
	const { sourceId, points, type, position } = payload;
	slice.state = StageState.DrawConnectLine;
	slice.draftConnectLine = {
		id: v1(),
		source: {
			id: sourceId,
			connectPointType: type,
			connectPosition: position,
		},
		points,
		locked: false,
	};

	clearSelectionConnectPointsStateChange(slice);

	// first find an element
	const el = selectElementById(slice.elements, sourceId);
	if (!el) {
		// case when element is not found for some reason
		return selectElementsStateChange(slice, []);
	}

	const connectLines = selectAllConnectLines(slice.connectLines);
	const sourceCpDescriptor = getConnectPointDescriptor(el, type, connectLines);
	// has element excited cardinality
	if (sourceCpDescriptor.cardinalityExcited) {
		return selectElementsStateChange(slice, []);
	}

	// calculate other elements cardinality
	const elInputCardinality = connectLines.reduce((elMap, cl) => {
		const elCardinality = elMap.get(cl.target.id) ?? 0;
		return elMap.set(cl.target.id, elCardinality + 1);
	}, new Map<string, number>());

	// leave only element that are allowed to connect and didn't excited cardinality
	const connectPointUpdates = selectAllElements(slice.elements)
		.filter((curEl) => {
			if (curEl.id === el.id) {
				return false;
			}

			if (!sourceCpDescriptor.allowedTypes.has(curEl.type)) {
				return false;
			}

			if (type === ConnectPointType.Input) {
				return false;
			}

			const { input = { cardinality: 0, allowedTypes: new Set() } } = findElementDescriptor(
				curEl.type,
				curEl.properties,
			);
			const inputCardinality = elInputCardinality.get(curEl.id) ?? 0;
			const inputCardinalityNotExcited = inputCardinality < input.cardinality;

			return inputCardinalityNotExcited && input.allowedTypes.has(el.type);
		})
		.reduce(
			(selectedElements: SelectedElement[], curEl: Element) => [
				...selectedElements,
				{
					id: curEl.id,
					visibility: {
						input: true,
						output: false,
						event: false,
					},
				},
			],
			[],
		);

	updateManyConnectPointsStateChange(slice, { connectPointUpdates });
	selectElementsStateChange(
		slice,
		connectPointUpdates.map((cpUpdate) => ({ id: cpUpdate.id })),
	);
};

export const moveConnectLinePointsByDeltaStateChange = (
	slice: Draft<StageSlice>,
	payload: MoveConnectLinePointsByDeltaPayload,
) => {
	const cl = selectConnectLineById(slice.connectLines, payload.id);
	if (!cl) {
		return;
	}

	const updatedPoints = payload.pointIndexes
		.filter((index) => index < cl.points.length)
		.reduce(
			(points, index) =>
				points.map((p, i) =>
					i !== index
						? p
						: {
								x: p.x + payload.dx,
								y: p.y + payload.dy,
						  },
				),
			cl.points,
		);

	slice.connectLines = connectLinesAdapter.updateOne(slice.connectLines, {
		id: cl.id,
		changes: {
			points: updatedPoints,
		},
	});
};

export const connectLinesAdapterReducers = {
	startConnectLineDraw: (slice: Draft<StageSlice>, action: StartConnectLineDrawAction) =>
		startConnectLineDrawStateChange(slice, action.payload),
	moveConnectLineDraw: (slice: Draft<StageSlice>, action: MoveConnectLineDrawAction) => {
		if (slice.state !== StageState.DrawConnectLine || !slice.draftConnectLine) {
			return;
		}

		const { draftConnectLine } = slice;
		if (draftConnectLine.locked) {
			return;
		}
		const { position, normalizePosition } = action.payload;

		if (!normalizePosition) {
			draftConnectLine.points.splice(-1, 1, position);
			return;
		}

		const lastPoint = draftConnectLine.points[draftConnectLine.points.length - 2];
		const newPosition =
			Math.abs(lastPoint.x - position.x) < Math.abs(lastPoint.y - position.y)
				? { x: lastPoint.x, y: position.y }
				: { x: position.x, y: lastPoint.y };

		draftConnectLine.points.splice(-1, 1, newPosition);
	},
	addNextPointConnectLineDraw: (
		slice: Draft<StageSlice>,
		action: AddPointConnectLineDrawAction,
	) => {
		const { draftConnectLine } = slice;
		if (!draftConnectLine) {
			return;
		}

		draftConnectLine.points.push({ x: action.payload.x, y: action.payload.y });
	},
	deleteConnectLineDraw: (slice: Draft<StageSlice>) => {
		const { draftConnectLine } = slice;
		if (slice.state !== StageState.DrawConnectLine || !draftConnectLine) {
			return;
		}

		slice.state = StageState.Select;
		slice.draftConnectLine = null;

		clearHighlightConnectPointsStateChange(slice);
		clearSelectionConnectPointsStateChange(slice);
		selectElementsStateChange(slice, [
			{
				id: draftConnectLine.source.id,
			},
		]);
		setSelectionConnectPointsStateChange(slice, [draftConnectLine.source.id]);
	},
	linkConnectLineDraw: (slice: Draft<StageSlice>, action: LinkConnectLineDrawAction) => {
		const { payload } = action;
		const { draftConnectLine } = slice;
		if (slice.state !== StageState.DrawConnectLine || !draftConnectLine) {
			return;
		}

		slice.state = StageState.Select;
		slice.draftConnectLine = null;

		clearHighlightConnectPointsStateChange(slice);
		clearSelectionConnectPointsStateChange(slice);
		selectElementsStateChange(slice, [
			{
				id: draftConnectLine.source.id,
			},
		]);
		setSelectionConnectPointsStateChange(slice, [draftConnectLine.source.id]);

		const el = selectElementById(slice.elements, payload.targetId);
		if (!el) {
			return;
		}

		slice.connectLines = connectLinesAdapter.addOne(slice.connectLines, {
			id: v1(),
			locked: false,
			points: [...draftConnectLine.points, action.payload.targetPoint],
			source: draftConnectLine.source,
			target: {
				id: el.id,
				connectPointType: payload.targetConnectPointType,
				connectPosition: payload.targetConnectPointPosition,
			},
		});
		removeAllDrawerAnimationStateChange(slice, { drawerId: payload.connectPointId });
	},
	moveConnectLinePointsByDelta: (
		slice: Draft<StageSlice>,
		action: MoveConnectLinePointsByDeltaAction,
	) => moveConnectLinePointsByDeltaStateChange(slice, action.payload),
	removeConnectLines: (slice: Draft<StageSlice>, action: RemoveConnectLinesAction) =>
		removeConnectLinesStateChange(slice, action.payload),
	movePointConnectLine: (slice: Draft<StageSlice>, action: MoveConnectLinePointAction) => {
		const { payload } = action;
		const cl = selectConnectLineById(slice.connectLines, payload.id);
		if (!cl) {
			return;
		}

		const mousePosition = { x: payload.x, y: payload.y };
		if (!payload.normalizePosition) {
			slice.connectLines = connectLinesAdapter.updateOne(slice.connectLines, {
				id: cl.id,
				changes: {
					points: cl.points.map((p, i) => (i !== payload.index ? p : mousePosition)),
				},
			});
			return;
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

		slice.connectLines = connectLinesAdapter.updateOne(slice.connectLines, {
			id: cl.id,
			changes: {
				points: cl.points.map((p, i) => (i !== payload.index ? p : normalizedPoint)),
			},
		});
	},
	removeElementConnectLines: (
		slice: Draft<StageSlice>,
		action: RemoveElementConnectLinesAction,
	) => {
		const { elementId, connectPointType } = action.payload;
		const connectLines = selectAllConnectLines(slice.connectLines);
		const elConnectLines = connectLines.filter(
			({ source, target }) => source.id === elementId || target.id === elementId,
		);

		if (!connectPointType) {
			slice.connectLines = connectLinesAdapter.removeMany(
				slice.connectLines,
				elConnectLines.map((cl) => cl.id),
			);
			return;
		}

		const eventConnectLineIds = elConnectLines
			.filter(
				({ source, target }) =>
					source.connectPointType === connectPointType ||
					target.connectPointType === connectPointType,
			)
			.map((cl) => cl.id);
		slice.connectLines = connectLinesAdapter.removeMany(
			slice.connectLines,
			eventConnectLineIds,
		);
	},
};

const globalConnectLinesSelector = connectLinesAdapter.getSelectors<RootState>(
	(state) => state.stage.connectLines,
);

export const selectStageDraftConnectLine = (state: RootState) => state.stage.draftConnectLine;

export const selectStageConnectLines = (state: RootState) =>
	globalConnectLinesSelector.selectAll(state);

export const selectStageConnectLineById = (id: string | null) => (state: RootState) =>
	!id ? null : globalConnectLinesSelector.selectById(state, id) ?? null;

