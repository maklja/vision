import { Draft, createEntityAdapter } from '@reduxjs/toolkit';
import { ConnectPointTypeVisibility } from '../../model';
import { StageSlice } from '../stageSlice';
import { RootState } from '../rootState';

export interface SelectedElement {
	id: string;
	visibleConnectPoints: ConnectPointTypeVisibility;
}

export interface SelectElementsAction {
	type: string;
	payload: SelectedElement[];
}

const selectedElementsAdapter = createEntityAdapter<SelectedElement>({
	selectId: (el) => el.id,
});

export const createSelectedElementsAdapterInitialState = () =>
	selectedElementsAdapter.getInitialState();

export const selectElementsStateChange = (
	slice: Draft<StageSlice>,
	elements: SelectedElement[],
) => {
	slice.selectedElements = selectedElementsAdapter.addMany(
		selectedElementsAdapter.removeAll(slice.selectedElements),
		elements,
	);
};

export const selectElementsAdapterReducers = {
	selectElements: (slice: Draft<StageSlice>, action: SelectElementsAction) =>
		selectElementsStateChange(slice, action.payload),
};

export const {
	selectAll: selectAllSelectedElements,
	selectById: selectSelectedElementById,
	selectEntities: selectSelectedElementEntities,
} = selectedElementsAdapter.getSelectors();

const globalSelectedElementsSelector = selectedElementsAdapter.getSelectors<RootState>(
	(state) => state.stage.selectedElements,
);

export const isSelectedElement = (elementId: string) => (state: RootState) =>
	Boolean(globalSelectedElementsSelector.selectById(state, elementId));

export const selectElementSelection = (elementId: string) => (state: RootState) =>
	globalSelectedElementsSelector.selectById(state, elementId) ?? null;

