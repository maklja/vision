import { v1 as createId } from 'uuid';
import { Draft } from '@reduxjs/toolkit';
import { ElementDescriptor, findElementDescriptor, Point } from '../../model';
import { StageSlice, StageState } from '../stageSlice';

export interface StartConnectLineDrawAction {
	type: string;
	payload: {
		sourceId: string;
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
	};
}

export const startConnectLineDrawReducer = (
	slice: Draft<StageSlice>,
	action: StartConnectLineDrawAction,
) => {
	const { connectLines, elements } = slice;
	const { sourceId, points } = action.payload;
	slice.state = StageState.DrawConnectLine;
	slice.draftConnectLine = {
		id: createId(),
		sourceId,
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
		output = { cardinality: 0, allowedTypes: new Set() },
		event = { cardinality: 0, allowedTypes: new Set() },
	}: ElementDescriptor = findElementDescriptor(el.type);
	if (!output && !event) {
		return;
	}

	// calculate element cardinality
	const elementSourceCount = connectLines.reduce(
		(sourceCount, cl) => (cl.sourceId === el.id ? sourceCount + 1 : sourceCount),
		0,
	);

	// has element excited cardinality
	const elCardinalityExcited = elementSourceCount >= output.cardinality + event.cardinality;
	if (output.allowedTypes.size === 0 || elCardinalityExcited) {
		slice.selected = [];
		return;
	}

	// calculate other elements cardinality
	const elementsCardinality = connectLines.reduce((elMap, cl) => {
		const cardinality = elMap.get(cl.targetId) ?? 0;
		return elMap.set(cl.targetId, cardinality + 1);
	}, new Map<string, number>());

	// leave only element that are allowed to connect and didn't excited cardinality
	slice.selected = elements
		.filter((curEl) => {
			if (curEl.id === el.id) {
				return false;
			}

			const descriptor = findElementDescriptor(curEl.type);
			if (!descriptor.input?.allowedTypes.has(el.type)) {
				return false;
			}

			const cardinalityNoExcited =
				(elementsCardinality.get(curEl.id) ?? 0) < descriptor.input?.cardinality;
			const allowedToConnect =
				output.allowedTypes.has(curEl.type) || event.allowedTypes.has(curEl.type);
			return cardinalityNoExcited && allowedToConnect;
		})
		.map((el) => el.id);
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

	slice.selected = [draftConnectLine.sourceId];
};

export const linkConnectLineDrawReducer = (
	slice: Draft<StageSlice>,
	action: LinkConnectLineDrawAction,
) => {
	const { draftConnectLine } = slice;
	if (slice.state !== StageState.DrawConnectLine || !draftConnectLine) {
		return;
	}

	slice.state = StageState.Select;
	slice.highlightedConnectPoints = [];
	slice.draftConnectLine = null;

	slice.selected = [draftConnectLine.sourceId];
	const el = slice.elements.find((curEl) => curEl.id === action.payload.targetId);
	if (!el) {
		return;
	}

	slice.connectLines.push({
		id: createId(),
		locked: false,
		sourceId: draftConnectLine.sourceId,
		points: [...draftConnectLine.points, action.payload.targetPoint],
		targetId: el.id,
	});
};

