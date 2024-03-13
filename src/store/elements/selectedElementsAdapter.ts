import { Draft, createEntityAdapter, createSelector } from '@reduxjs/toolkit';
import { StageSlice } from '../stageSlice';
import { RootState } from '../rootState';
import { selectAllElements } from './elementsAdapter';

export interface SelectedElement {
	id: string;
}

export interface SelectElementsAction {
	type: string;
	payload: SelectedElement[];
}

export interface AddElementsToSelectionAction {
	type: string;
	payload: SelectedElement[];
}

export interface ToggleSelectElementAction {
	type: string;
	payload: SelectedElement;
}

export interface SelectElementAction {
	type: string;
	payload: SelectedElement;
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

export function selectElementStateChange(slice: Draft<StageSlice>, element: SelectedElement) {
	const selectEl = selectSelectedElementById(slice.selectedElements, element.id);
	if (selectEl) {
		return;
	}

	slice.selectedElements = selectedElementsAdapter.addOne(
		selectedElementsAdapter.removeAll(slice.selectedElements),
		element,
	);
}

export function toggleSelectElementStateChange(slice: Draft<StageSlice>, element: SelectedElement) {
	const elementSelection = selectSelectedElementById(slice.selectedElements, element.id);
	if (elementSelection) {
		slice.selectedElements = selectedElementsAdapter.removeOne(
			slice.selectedElements,
			element.id,
		);
	} else {
		slice.selectedElements = selectedElementsAdapter.addOne(slice.selectedElements, element);
	}
}

export function addToSelectionStateChange(slice: Draft<StageSlice>, elements: SelectedElement[]) {
	if (elements.length === 0) {
		return;
	}

	slice.selectedElements = selectedElementsAdapter.addMany(slice.selectedElements, elements);
}

export const selectElementsAdapterReducers = {
	selectElements: (slice: Draft<StageSlice>, action: SelectElementsAction) =>
		selectElementsStateChange(slice, action.payload),
	addElementsToSelection: (slice: Draft<StageSlice>, action: AddElementsToSelectionAction) =>
		addToSelectionStateChange(slice, action.payload),
	toggleSelectElement: (slice: Draft<StageSlice>, action: ToggleSelectElementAction) =>
		toggleSelectElementStateChange(slice, action.payload),
	selectElement: (slice: Draft<StageSlice>, action: SelectElementAction) =>
		selectElementStateChange(slice, action.payload),
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

