import { StateCreator } from 'zustand';
import { RootState } from '../rootStore';

export interface CreateElementErrorPayload {
	elementId: string;
	errorId: string;
	errorMessage: string;
}

export interface ElementError {
	errorId: string;
	errorMessage: string;
}

export interface ErrorSlice {
	errors: Record<string, ElementError>;
	createElementError: (payload: CreateElementErrorPayload) => void;
	clearErrors: () => void;
}

export const createErrorSlice: StateCreator<RootState, [], [], ErrorSlice> = (set) => ({
	errors: {},
	createElementError: (payload: CreateElementErrorPayload) =>
		set((state) => {
			state.errors[payload.elementId] = {
				errorId: payload.errorId,
				errorMessage: payload.errorMessage,
			};

			return state;
		}, true),
	clearErrors: () =>
		set((state) => {
			state.errors = {};

			return state;
		}, true),
});

export const selectElementErrorById =
	(elementId: string | null) =>
	(state: RootState): ElementError | null => {
		if (!elementId) {
			return null;
		}

		return state.errors[elementId];
	};

