import { Draft, createSelector } from '@reduxjs/toolkit';
import { StageSlice } from '../stageSlice';
import { RootState } from '../rootState';
import { BoundingBox, Point } from '../../model';

export enum StageState {
	Select = 'select',
	LassoSelect = 'lassoSelect',
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

export interface LassoSelectionAction {
	type: string;
	payload: Point | null;
}

export const updateStateChange = (slice: Draft<StageSlice>, state: StageState) => {
	slice.state = state;
};

export const stageReducers = {
	changeState: (slice: Draft<StageSlice>, action: ChangeStateAction) =>
		updateStateChange(slice, action.payload),
	startLassoSelection: (slice: Draft<StageSlice>, action: LassoSelectionAction) => {
		if (!action.payload) {
			return;
		}

		slice.state = StageState.LassoSelect;
		slice.lassoSelection = {
			x: action.payload.x,
			y: action.payload.y,
			width: 0,
			height: 0,
		};
	},
	updateLassoSelection: (slice: Draft<StageSlice>, action: LassoSelectionAction) => {
		if (!action.payload || !slice.lassoSelection) {
			return;
		}

		const { x, y } = slice.lassoSelection;
		const width = action.payload.x - x;
		const height = action.payload.y - y;
		slice.lassoSelection = {
			x,
			y,
			width,
			height,
		};
	},
	stopLassoSelection: (slice: Draft<StageSlice>) => {
		slice.lassoSelection = null;
		slice.state = StageState.Select;
	},
};

export const selectStageState = (state: RootState) => state.stage.state;

const selectLassoBoundingBox = createSelector(
	(state: RootState) => state.stage.lassoSelection,
	(lassoSelection) => {
		if (!lassoSelection) {
			return null;
		}

		const [p1, , , p4] = BoundingBox.copy(lassoSelection).points.sort((p1, p2) => {
			const dx = p1.x - p2.x;
			return dx != 0 ? dx : p1.y - p2.y;
		});
		const x = Math.min(p1.x, p4.x);
		const y = Math.min(p1.y, p4.y);
		const width = Math.abs(p4.x - p1.x);
		const height = Math.abs(p4.y - p1.y);

		return {
			x,
			y,
			width,
			height,
		};
	},
);

export const selectLasso = (state: RootState) => selectLassoBoundingBox(state);

