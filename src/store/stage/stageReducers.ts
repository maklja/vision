import { Draft } from '@reduxjs/toolkit';
import { StageSlice } from '../stageSlice';
import { RootState } from '../rootState';

export enum StageState {
	Select = 'select',
	DrawConnectLine = 'drawConnectLine',
	Dragging = 'dragging',
	SnapDragging = 'snapDragging',
	DrawElement = 'drawElement',
}

const draggingStates = [StageState.Dragging, StageState.SnapDragging];
export const isStageStateDragging = (state: StageState) => draggingStates.includes(state);

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

