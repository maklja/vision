import { Draft, createEntityAdapter } from '@reduxjs/toolkit';
import { StageSlice } from '../stageSlice';
import { RootState } from '../rootState';

export interface SelectedConnectLine {
	id: string;
}

export interface SelectConnectLinesAction {
	type: string;
	payload: SelectedConnectLine[];
}

const selectedConnectLinesAdapter = createEntityAdapter<SelectedConnectLine>({
	selectId: (cl) => cl.id,
});

export const createSelectedConnectLinesAdapterInitialState = () =>
	selectedConnectLinesAdapter.getInitialState();

export const selectConnectLinesStateChange = (
	slice: Draft<StageSlice>,
	connectLines: SelectedConnectLine[],
) => {
	slice.selectedConnectLines = selectedConnectLinesAdapter.addMany(
		selectedConnectLinesAdapter.removeAll(slice.selectedConnectLines),
		connectLines,
	);
};

export const selectConnectLinesAdapterReducers = {
	selectConnectLines: (slice: Draft<StageSlice>, action: SelectConnectLinesAction) =>
		selectConnectLinesStateChange(slice, action.payload),
};

export const {
	selectAll: selectAllSelectedConnectLines,
	selectById: selectSelectedConnectLineById,
} = selectedConnectLinesAdapter.getSelectors();

const globalConnectLineSelector = selectedConnectLinesAdapter.getSelectors<RootState>(
	(state) => state.stage.selectedConnectLines,
);

export const isSelectedConnectLine = (connectLineId: string) => (state: RootState) =>
	Boolean(globalConnectLineSelector.selectById(state, connectLineId));

export const selectConnectLineSelection = (connectLineId: string) => (state: RootState) =>
	globalConnectLineSelector.selectById(state, connectLineId) ?? null;

