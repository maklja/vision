import { Draft, createEntityAdapter } from '@reduxjs/toolkit';
import { StageSlice } from '../stageSlice';
import { RootState } from '../rootState';

export interface HighlightElement {
	id: string;
}

export interface HighlightElementsAction {
	type: string;
	payload: HighlightElement[];
}

const highlightAdapter = createEntityAdapter<HighlightElement>({
	selectId: (el) => el.id,
});

export const highlightStateChange = (slice: Draft<StageSlice>, elements: HighlightElement[]) => {
	slice.highlighted = highlightAdapter.addMany(
		highlightAdapter.removeAll(slice.highlighted),
		elements,
	);
};

export const { selectAll: selectAllHighlighted, selectById: selectHighlightedById } =
	highlightAdapter.getSelectors();

export const createHighlightedAdapterInitialState = () => highlightAdapter.getInitialState();

export const selectHighlighAdapterReducers = {
	highlight: (slice: Draft<StageSlice>, action: HighlightElementsAction) =>
		highlightStateChange(slice, action.payload),
};

const globalHighlightedElementsSelector = highlightAdapter.getSelectors<RootState>(
	(state) => state.stage.highlighted,
);

export const isHighlighted = (elementId: string) => (state: RootState) =>
	Boolean(globalHighlightedElementsSelector.selectById(state, elementId));

