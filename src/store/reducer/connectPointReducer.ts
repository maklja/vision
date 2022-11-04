import { Draft } from '@reduxjs/toolkit';
import { StageSlice } from '../stageSlice';

export interface PinConnectLineAction {
	type: string;
	payload: {
		elementId: string;
		position: { x: number; y: number };
	};
}

export const pinConnectLineReducer = (slice: Draft<StageSlice>, action: PinConnectLineAction) => {
	if (!slice.draftConnectLine) {
		return;
	}

	const lastPoint = slice.draftConnectLine.points.at(-1);

	if (!lastPoint) {
		return;
	}
	lastPoint.x = action.payload.position.x;
	lastPoint.y = action.payload.position.y;
	slice.draftConnectLine.locked = true;
};

export const unpinConnectLineReducer = (slice: Draft<StageSlice>) => {
	if (!slice.draftConnectLine) {
		return;
	}

	slice.draftConnectLine.locked = false;
};
