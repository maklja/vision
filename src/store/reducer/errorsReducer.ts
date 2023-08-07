import { Draft, createEntityAdapter } from '@reduxjs/toolkit';
import { StageSlice } from '../stageSlice';
import { RootState } from '../rootState';

export interface ElementError {
	elementId: string;
	errorId: string;
	errorMessage: string;
}

export const errorsAdapter = createEntityAdapter<ElementError>({
	selectId: (elementError) => elementError.elementId,
});

export interface CreateElementErrorAction {
	type: string;
	payload: {
		elementId: string;
		errorId: string;
		errorMessage: string;
	};
}

export const createElementErrorReducer = (
	slice: Draft<StageSlice>,
	action: CreateElementErrorAction,
) => {
	slice.errors = errorsAdapter.addOne(slice.errors, action.payload);
};

export const clearErrorsReducer = (slice: Draft<StageSlice>) => {
	slice.errors = errorsAdapter.removeAll(slice.errors);
};

const errorsSelector = errorsAdapter.getSelectors<RootState>((state) => state.stage.errors);

export const selectElementErrorById =
	(elementId: string) =>
	(state: RootState): ElementError | null => {
		return errorsSelector.selectById(state, elementId) ?? null;
	};
