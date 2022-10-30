import { v1 as createId } from 'uuid';
import { Draft } from '@reduxjs/toolkit';
import { calculateConnectPointTypes, ConnectLine } from '../../model';
import { StageSlice, StageState } from '../stageSlice';
import { createBoundingBox } from '../../drawers/utils';

export interface StartConnectLineDrawAction {
	type: string;
	payload: Omit<ConnectLine, 'id'>;
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
	};
}

export const startConnectLineDrawReducer = (
	slice: Draft<StageSlice>,
	action: StartConnectLineDrawAction,
) => {
	const { connectLines, elements } = slice;
	const draftConnectLineId = createId();
	slice.state = StageState.DrawConnectLine;
	slice.draftConnectLineId = draftConnectLineId;
	connectLines.push({
		...action.payload,
		id: draftConnectLineId,
	});

	const { sourceId } = action.payload;
	// first find an element
	const el = elements.find((curEl) => curEl.id === sourceId);
	if (!el) {
		// case when element is not found for some reason
		slice.selected = [];
		return;
	}

	// each element can be source element only once
	const isElementSource = connectLines.some((cl) => cl.sourceId === el.id && cl.targetId != null);
	if (isElementSource) {
		slice.selected = [];
		return;
	}

	// all elements that already have a source element
	const elementsWithSource = connectLines.reduce(
		(set, cl) => (cl.targetId ? set.add(cl.targetId) : set),
		new Set<string>(),
	);
	// allowed types to connect
	const allowedTypesToConnect = calculateConnectPointTypes(el.type);
	slice.selected = elements
		.filter(
			(curEl) =>
				curEl.id !== sourceId &&
				allowedTypesToConnect.has(curEl.type) &&
				!elementsWithSource.has(curEl.id),
		)
		.map((curEl) => curEl.id);
};

export const moveConnectLineDrawReducer = (
	slice: Draft<StageSlice>,
	action: MoveConnectLineDrawAction,
) => {
	if (slice.state !== StageState.DrawConnectLine || !slice.draftConnectLineId) {
		return;
	}

	const cl = slice.connectLines.find((cl) => cl.id === slice.draftConnectLineId);
	if (!cl || cl.locked) {
		return;
	}

	cl.points.splice(-1, 1, { x: action.payload.x, y: action.payload.y });
};

export const deleteConnectLineDrawReducer = (slice: Draft<StageSlice>) => {
	const { draftConnectLineId } = slice;
	if (slice.state !== StageState.DrawConnectLine || !draftConnectLineId) {
		return;
	}

	slice.state = StageState.Select;
	slice.highlightedConnectPoints = [];
	slice.draftConnectLineId = null;
	const slIndex = slice.connectLines.findIndex((cl) => cl.id === draftConnectLineId);
	if (slIndex === -1) {
		return;
	}

	slice.selected = [slice.connectLines[slIndex].sourceId];
	slice.connectLines.splice(slIndex, 1);
};

export const linkConnectLineDrawReducer = (
	slice: Draft<StageSlice>,
	action: LinkConnectLineDrawAction,
) => {
	const { draftConnectLineId } = slice;
	if (slice.state !== StageState.DrawConnectLine || !draftConnectLineId) {
		return;
	}

	slice.state = StageState.Select;
	slice.highlightedConnectPoints = [];
	slice.draftConnectLineId = null;
	const slIndex = slice.connectLines.findIndex((cl) => cl.id === draftConnectLineId);
	if (slIndex === -1) {
		return;
	}

	slice.selected = [slice.connectLines[slIndex].sourceId];
	const el = slice.elements.find((curEl) => curEl.id === action.payload.targetId);
	if (!el) {
		slice.connectLines.splice(slIndex, 1);
		return;
	}

	const bb = createBoundingBox(el.x, el.y, el.size);
	const cl = slice.connectLines[slIndex];
	cl.targetId = el.id;
	cl.locked = false;
	cl.points.push({
		x: bb.center.x,
		y: bb.center.y,
	});
};
