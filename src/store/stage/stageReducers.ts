import { Draft } from '@reduxjs/toolkit';
import { StageSlice } from '../stageSlice';
import { RootState } from '../rootState';

export enum StageState {
	Select = 'select',
	DrawConnectLine = 'drawConnectLine',
	Dragging = 'dragging',
	DrawElement = 'drawElement',
}

export interface ChangeStateAction {
	type: string;
	payload: StageState;
}

export const updateStateChange = (slice: Draft<StageSlice>, state: StageState) => {
	slice.state = state;
};

export const stageReducers = {
	changeState: (slice: Draft<StageSlice>, action: ChangeStateAction) =>
		updateStateChange(slice, action.payload),
};

export const selectStageState = (state: RootState) => state.stage.state;

