import { Draft } from '@reduxjs/toolkit';
import { StageSlice } from '../stageSlice';

export interface PinConnectLineAction {
	type: string;
	payload: {
		drawerId: string;
		position: { x: number; y: number };
	};
}

export const pinConnectLineReducer = (slice: Draft<StageSlice>, action: PinConnectLineAction) => {
	if (!slice.draftConnectLineId) {
		return;
	}

	const clIndex = slice.connectLines.findIndex((cl) => cl.id === slice.draftConnectLineId);
	if (clIndex === -1) {
		return;
	}

	const cl = slice.connectLines[clIndex];
	const lastPoint = cl.points.at(-1);

	if (!lastPoint) {
		return;
	}
	lastPoint.x = action.payload.position.x;
	lastPoint.y = action.payload.position.y;
	cl.locked = true;
};

export const unpinConnectLineReducer = (slice: Draft<StageSlice>) => {
	if (!slice.draftConnectLineId) {
		return;
	}

	const clIndex = slice.connectLines.findIndex((cl) => cl.id === slice.draftConnectLineId);
	if (clIndex === -1) {
		return;
	}

	slice.connectLines[clIndex].locked = false;
};
