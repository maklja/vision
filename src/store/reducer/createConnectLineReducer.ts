import { v1 as createId } from 'uuid';
import { Draft } from '@reduxjs/toolkit';
import {
	ConnectLine,
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

const getConnectPointDescriptor = (
	el: Element,
	cpType: ConnectPointType,
	connectLines: ConnectLine[],
) => {
	const elDescriptor: ElementDescriptor = findElementDescriptor(el.type);

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
	const el = elements.entities
	if (!el) {
		// case when element is not found for some reason
		slice.selectedElements = [];
		return;
	}

	const sourceCpDescriptor = getConnectPointDescriptor(el, type, connectLines);
	// has element excited cardinality
	if (sourceCpDescriptor.cardinalityExcited) {
		slice.selectedElements = [];
		return;
	}

	// calculate other elements cardinality
	const elInputCardinality = connectLines.reduce((elMap, cl) => {
		const elCardinality = elMap.get(cl.target.id) ?? 0;
		return elMap.set(cl.target.id, elCardinality + 1);
	}, new Map<string, number>());

	// leave only element that are allowed to connect and didn't excited cardinality
	slice.selectedElements = elements
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
					visibleConnectPoints: {
						input: true,
						output: false,
						event: false,
					},
				},
			],
			[],
		);
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

	slice.selectedElements = [
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

	slice.selectedElements = [
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

