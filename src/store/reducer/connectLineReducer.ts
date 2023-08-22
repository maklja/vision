import { Draft } from '@reduxjs/toolkit';
import { StageSlice } from '../stageSlice';

export interface SelectConnectLinesAction {
	type: string;
	payload: {
		connectLineIds: string[];
	};
}

export const selectConnectLinesReducer = (
	slice: Draft<StageSlice>,
	action: SelectConnectLinesAction,
) => {
	slice.selectedConnectLines = action.payload.connectLineIds;
};

