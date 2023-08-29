import { Draft, createEntityAdapter, createSelector } from '@reduxjs/toolkit';
import { ConnectPointTypeVisibility } from '../../model';
import { StageSlice } from '../stageSlice';
import { RootState } from '../rootState';
import { selectAllElements } from './elementsAdapter';

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

export const {
	selectAll: selectAllSelectedElements,
	selectById: selectSelectedElementById,
	selectEntities: selectSelectedElementEntities,
	selectTotal: selectSelectedElementsTotal,
} = selectedElementsAdapter.getSelectors();

export const selectElementsStateChange = (
	slice: Draft<StageSlice>,
	elements: SelectedElement[],
) => {
	const totalSelected = selectSelectedElementsTotal(slice.selectedElements);
	if (totalSelected === 0 && elements.length === 0) {
		return;
	}

	slice.selectedElements = selectedElementsAdapter.addMany(
		selectedElementsAdapter.removeAll(slice.selectedElements),
		elements,
	);
};

export const selectElementsAdapterReducers = {
	selectElements: (slice: Draft<StageSlice>, action: SelectElementsAction) =>
		selectElementsStateChange(slice, action.payload),
};

const globalSelectedElementsSelector = selectedElementsAdapter.getSelectors<RootState>(
	(state) => state.stage.selectedElements,
);

export const selectElementsInSelection = createSelector(
	(state: RootState) => state.stage.selectedElements,
	(state: RootState) => state.stage.elements,
	(selectedEntities, elementEntities) => {
		const selectedElement = selectSelectedElementEntities(selectedEntities);
		const elements = selectAllElements(elementEntities);
		return elements.filter((el) => Boolean(selectedElement[el.id]));
	},
);

export const isSelectedElement = (elementId: string) => (state: RootState) =>
	Boolean(globalSelectedElementsSelector.selectById(state, elementId));

export const selectElementSelection = (elementId: string) => (state: RootState) =>
	globalSelectedElementsSelector.selectById(state, elementId) ?? null;

