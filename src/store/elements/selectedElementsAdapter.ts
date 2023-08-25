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

const selectElements = (slice: Draft<StageSlice>, elements: SelectedElement[]) => {
	slice.selectedElements = selectedElementsAdapter.addMany(slice.selectedElements, elements);
};

export const selectElementsAdapterReducers = {
	selectElements: (slice: Draft<StageSlice>, action: SelectElementsAction) =>
		selectElements(slice, action.payload),
};

export const { selectAll: selectAllSelectedElements, selectById: selectSelectedElementById } =
	selectedElementsAdapter.getSelectors();

const globalElementsSelector = selectedElementsAdapter.getSelectors<RootState>(
	(state) => state.stage.selectedElements,
);

export const isSelectedElement = (elementId: string) => (state: RootState) =>
	Boolean(globalElementsSelector.selectById(state, elementId));

export const selectElementSelection = (elementId: string) => (state: RootState) =>
	globalElementsSelector.selectById(state, elementId) ?? null;
