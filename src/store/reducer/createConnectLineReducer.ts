import Konva from 'konva';
import { Draft } from '@reduxjs/toolkit';
import { ConnectLine } from '../../model';
import { StageSlice, StageState } from '../stageSlice';

export interface StartConnectLineDrawAction {
	type: string;
	payload: ConnectLine;
}

export interface MoveConnectLineDrawAction {
	type: string;
	payload: {
		id: string;
		point: Konva.Vector2d;
	};
}

export interface EndConnectLineDrawAction {
	type: string;
	payload: {
		id: string;
	};
}

export const startConnectLineDrawReducer = (
	slice: Draft<StageSlice>,
	action: StartConnectLineDrawAction,
) => {
	slice.state = StageState.DrawConnectLine;
	slice.connectLines.push(action.payload);
};

export const moveConnectLineDrawReducer = (
	slice: Draft<StageSlice>,
	action: MoveConnectLineDrawAction,
) => {
	if (slice.state !== StageState.DrawConnectLine) {
		return;
	}

	const cl = slice.connectLines.find((cl) => cl.id === action.payload.id);
	if (!cl) {
		return;
	}

	cl.points.splice(-1, 1, action.payload.point);
};

export const endConnectLineDrawReducer = (
	slice: Draft<StageSlice>,
	action: EndConnectLineDrawAction,
) => {
	if (slice.state !== StageState.DrawConnectLine) {
		return;
	}

	slice.state = StageState.Select;
	slice.connectLines = slice.connectLines.filter((cl) => cl.id !== action.payload.id);
};

