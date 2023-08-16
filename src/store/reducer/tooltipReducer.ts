import { Draft } from '@reduxjs/toolkit';
import { StageSlice } from '../stageSlice';
import { RootState } from '../rootState';

export interface ElementTooltip {
	elementId: string;
	text: string | null;
}

export interface ShowTooltipAction {
	type: string;
	payload: {
		elementId: string;
		text?: string;
	};
}

export const showTooltipReducer = (slice: Draft<StageSlice>, action: ShowTooltipAction) => {
	slice.tooltip = {
		elementId: action.payload.elementId,
		text: action.payload.text ?? null,
	};
};

export const hideTooltipReducer = (slice: Draft<StageSlice>) => {
	slice.tooltip = null;
};

export const selectTooltip = (state: RootState) => state.stage.tooltip;

