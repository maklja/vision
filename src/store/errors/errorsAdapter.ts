import { Draft, createEntityAdapter } from '@reduxjs/toolkit';
import { StageSlice } from '../stageSlice';
import { RootState } from '../rootState';

export interface ElementError {
	elementId: string;
	errorId: string;
	errorMessage: string;
}

export interface CreateElementErrorPayload {
	elementId: string;
	errorId: string;
	errorMessage: string;
}

export interface CreateElementErrorAction {
	type: string;
	payload: CreateElementErrorPayload;
}

const errorsAdapter = createEntityAdapter<ElementError>({
	selectId: (elementError) => elementError.elementId,
});

const errorsSelector = errorsAdapter.getSelectors<RootState>((state) => state.stage.errors);

export const createErrorsAdapterInitialState = () => errorsAdapter.getInitialState();

export const createElementErrorStateChange = (
	slice: Draft<StageSlice>,
	payload: CreateElementErrorPayload,
) => {
	slice.errors = errorsAdapter.addOne(slice.errors, payload);
};

export const clearErrorsStateChange = (slice: Draft<StageSlice>) => {
	slice.errors = errorsAdapter.removeAll(slice.errors);
};

export const errorReducers = {
	createElementError: (slice: Draft<StageSlice>, action: CreateElementErrorAction) =>
		createElementErrorStateChange(slice, action.payload),
	clearErrors: (slice: Draft<StageSlice>) => clearErrorsStateChange(slice),
};

export const selectElementErrorById =
	(elementId: string | null) =>
	(state: RootState): ElementError | null => {
		if (!elementId) {
			return null;
		}

		return errorsSelector.selectById(state, elementId) ?? null;
	};

