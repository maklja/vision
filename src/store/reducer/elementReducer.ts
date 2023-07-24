import { Draft } from '@reduxjs/toolkit';
import { StageSlice, StageState } from '../stageSlice';
import { Element } from '../../model';

export interface CreateDraftElementAction {
	type: string;
	payload: Element;
}

export interface AddDraftElementAction {
	type: string;
	payload: Element;
}

export const createDraftElementReducer = (
	slice: Draft<StageSlice>,
	action: CreateDraftElementAction,
) => {
	slice.state = StageState.DrawElement;
	slice.draftElement = action.payload;
};

export const addDraftElementReducer = (slice: Draft<StageSlice>, action: AddDraftElementAction) => {
	slice.state = StageState.Select;

	if (!slice.draftElement) {
		return;
	}

	slice.elements = [...slice.elements, action.payload];
	slice.draftElement = null;
};

export const clearDraftElementReducer = (slice: Draft<StageSlice>) => {
	slice.state = StageState.Select;
	slice.draftElement = null;
};
