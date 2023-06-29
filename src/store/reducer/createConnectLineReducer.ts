import { v1 as createId } from 'uuid';
import { Draft } from '@reduxjs/toolkit';
import {
	ConnectPointPosition,
	ConnectPointType,
	Element,
	ElementDescriptor,
	findElementDescriptor,
	Point,
} from '../../model';
import { SelectedElement, StageSlice, StageState } from '../stageSlice';

export interface StartConnectLineDrawAction {
	type: string;
	payload: {
		sourceId: string;
		type: ConnectPointType;
		position: ConnectPointPosition;
		points: Point[];
	};
}

export interface MoveConnectLineDrawAction {
	type: string;
	payload: {
		x: number;
		y: number;
	};
}

export interface LinkConnectLineDrawAction {
	type: string;
	payload: {
		targetId: string;
		targetPoint: Point;
		targetConnectPointType: ConnectPointType;
		targetConnectPointPosition: ConnectPointPosition;
	};
}

export const startConnectLineDrawReducer = (
	slice: Draft<StageSlice>,
	action: StartConnectLineDrawAction,
) => {
	const { connectLines, elements } = slice;
	const { sourceId, points, type, position } = action.payload;
	slice.state = StageState.DrawConnectLine;
	slice.draftConnectLine = {
		id: createId(),
		source: {
			id: sourceId,
			connectPointType: type,
			connectPosition: position,
		},
		points,
		locked: false,
	};

	// first find an element
	const el = elements.find((curEl) => curEl.id === sourceId);
	if (!el) {
		// case when element is not found for some reason
		slice.selected = [];
		return;
	}

	const {
		output: sourceOutput = { cardinality: 0, allowedTypes: new Set() },
		event: sourceEvent = { cardinality: 0, allowedTypes: new Set() },
	}: ElementDescriptor = findElementDescriptor(el.type);

	// calculate element cardinality
	const elConnectTypeCardinality = connectLines.reduce((map, cl) => {
		if (cl.source.id !== el.id) {
			return map;
		}
		const connectTypeCardinality = map.get(cl.source.connectPointType) ?? 0;
		return map.set(cl.source.connectPointType, connectTypeCardinality + 1);
	}, new Map<ConnectPointType, number>());

	// has element excited output cardinality
	const outputCardinality = elConnectTypeCardinality.get(ConnectPointType.Output) ?? 0;
	if (type === ConnectPointType.Output && outputCardinality >= sourceOutput.cardinality) {
		slice.selected = [];
		return;
	}

	// has element excited event cardinality
	const eventCardinality = elConnectTypeCardinality.get(ConnectPointType.Event) ?? 0;
	if (type === ConnectPointType.Event && eventCardinality >= sourceEvent.cardinality) {
		slice.selected = [];
		return;
	}

	// calculate other elements cardinality
	const elementsCardinality = connectLines.reduce((elMap, cl) => {
		let connectTypeMap = elMap.get(cl.target.id);
		if (!connectTypeMap) {
			connectTypeMap = new Map<ConnectPointType, number>();
			elMap.set(cl.target.id, connectTypeMap);
		}

		const cardinality = connectTypeMap.get(cl.target.connectPointType) ?? 0;
		connectTypeMap.set(cl.target.connectPointType, cardinality + 1);

		return elMap;
	}, new Map<string, Map<ConnectPointType, number>>());

	// leave only element that are allowed to connect and didn't excited cardinality
	slice.selected = elements
		.filter((curEl) => {
			if (curEl.id === el.id) {
				return false;
			}

			if (type === ConnectPointType.Event && !sourceEvent.allowedTypes.has(curEl.type)) {
				return false;
			}

			if (type === ConnectPointType.Output && !sourceOutput.allowedTypes.has(curEl.type)) {
				return false;
			}

			const { input, event } = findElementDescriptor(curEl.type);
			const inputAllowed = input?.allowedTypes.has(el.type);
			if (type === ConnectPointType.Output) {
				return inputAllowed;
			}

			const eventAllowed = event?.allowedTypes.has(el.type);
			return inputAllowed || eventAllowed;
		})
		.reduce((selectedElements: SelectedElement[], curEl: Element) => {
			const {
				input = { cardinality: 0, allowedTypes: new Set() },
				event = { cardinality: 0, allowedTypes: new Set() },
			} = findElementDescriptor(curEl.type);
			const elCardinality = elementsCardinality.get(curEl.id);
			const inputCardinality = elCardinality?.get(ConnectPointType.Input) ?? 0;
			const inputCardinalityNotExcited = inputCardinality < input.cardinality;
			const eventCardinality = elCardinality?.get(ConnectPointType.Event) ?? 0;
			const eventCardinalityNotExcited = eventCardinality < event.cardinality;

			const inputVisible =
				inputCardinalityNotExcited &&
				(type === ConnectPointType.Output || type === ConnectPointType.Event);

			console.log(eventCardinalityNotExcited);
			if (!inputVisible && !eventCardinalityNotExcited) {
				return selectedElements;
			}

			return [
				...selectedElements,
				{
					id: curEl.id,
					visibleConnectPoints: {
						input: true,
						output: false,
						event: false,
					},
				},
			];
		}, []);
};

export const moveConnectLineDrawReducer = (
	slice: Draft<StageSlice>,
	action: MoveConnectLineDrawAction,
) => {
	if (slice.state !== StageState.DrawConnectLine || !slice.draftConnectLine) {
		return;
	}

	const { draftConnectLine } = slice;
	if (draftConnectLine.locked) {
		return;
	}

	draftConnectLine.points.splice(-1, 1, { x: action.payload.x, y: action.payload.y });
};

export const deleteConnectLineDrawReducer = (slice: Draft<StageSlice>) => {
	const { draftConnectLine } = slice;
	if (slice.state !== StageState.DrawConnectLine || !draftConnectLine) {
		return;
	}

	slice.state = StageState.Select;
	slice.highlightedConnectPoints = [];
	slice.draftConnectLine = null;

	slice.selected = [
		{
			id: draftConnectLine.source.id,
			visibleConnectPoints: {
				input: false,
			},
		},
	];
};

export const linkConnectLineDrawReducer = (
	slice: Draft<StageSlice>,
	action: LinkConnectLineDrawAction,
) => {
	const { payload } = action;
	const { draftConnectLine } = slice;
	if (slice.state !== StageState.DrawConnectLine || !draftConnectLine) {
		return;
	}

	slice.state = StageState.Select;
	slice.highlightedConnectPoints = [];
	slice.draftConnectLine = null;

	slice.selected = [
		{
			id: draftConnectLine.source.id,
			visibleConnectPoints: {
				input: false,
			},
		},
	];
	const el = slice.elements.find((curEl) => curEl.id === payload.targetId);
	if (!el) {
		return;
	}

	slice.connectLines.push({
		id: createId(),
		locked: false,
		points: [...draftConnectLine.points, action.payload.targetPoint],
		source: draftConnectLine.source,
		target: {
			id: el.id,
			connectPointType: payload.targetConnectPointType,
			connectPosition: payload.targetConnectPointPosition,
		},
	});
};

