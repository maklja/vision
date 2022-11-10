import { v1 as createId } from 'uuid';
import { Draft } from '@reduxjs/toolkit';
import { calculateConnectPointTypes, Point } from '../../model';
import { StageSlice, StageState } from '../stageSlice';
import { createBoundingBox } from '../../drawers/utils';

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

	// each element can be source element only once
	const isElementSource = connectLines.some((cl) => cl.sourceId === el.id);
	if (isElementSource) {
		slice.selected = [];
		return;
	}

	// all elements that already have a source element
	const elementsWithSource = connectLines.reduce(
		(set, cl) => set.add(cl.targetId),
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

	const bb = createBoundingBox(el.x, el.y, el.size);
	slice.connectLines.push({
		id: createId(),
		locked: false,
		sourceId: draftConnectLine.sourceId,
		points: [
			...draftConnectLine.points,
			{
				x: bb.center.x,
				y: bb.center.y,
			},
		],
		targetId: el.id,
	});
};
