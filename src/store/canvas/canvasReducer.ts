import { Draft } from '@reduxjs/toolkit';
import { StageSlice } from '../stageSlice';
import { RootState } from '../rootState';

export interface CanvasState {
	x: number;
	y: number;
	width: number;
	height: number;
	scaleX: number;
	scaleY: number;
}

export interface UpdateCanvasStateAction {
	type: string;
	payload: Partial<CanvasState>;
}

export const updateCanvasStateChange = (
	slice: Draft<StageSlice>,
	canvasStatePayload: Partial<CanvasState>,
) => {
	slice.canvasState = {
		...slice.canvasState,
		...canvasStatePayload,
	};
};

export const createCanvasInitialState = (): CanvasState => ({
	x: 0,
	y: 0,
	width: 0,
	height: 0,
	scaleX: 0,
	scaleY: 0,
});

export const canvasStateReducers = {
	updateCanvasState: (slice: Draft<StageSlice>, action: UpdateCanvasStateAction) =>
		updateCanvasStateChange(slice, action.payload),
};

export const selectCanvasState = (state: RootState) => state.stage.canvasState;

