import { Draft } from '@reduxjs/toolkit';
import { StageSlice, StageState } from '../stageSlice';
import { Element } from '../../model';

export interface CreateDraftElementAction {
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

