import { StateCreator } from 'zustand';
import { RootStore } from '../rootStore';

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

export const createErrorSlice: StateCreator<RootStore, [], [], ErrorSlice> = (set) => ({
	errors: {},
	createElementError: (payload: CreateElementErrorPayload) =>
		set((state) => {
			state.errors[payload.elementId] = {
				errorId: payload.errorId,
				errorMessage: payload.errorMessage,
			};

			return state;
		}),
	clearErrors: () =>
		set((state) => {
			state.errors = {};

			return state;
		}),
});

export const selectElementErrorById =
	(elementId: string | null) =>
	(state: RootStore): ElementError | null => {
		if (!elementId) {
			return null;
		}

		return state.errors[elementId];
	};

