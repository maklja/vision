import { current } from 'immer';
import { Draft, createEntityAdapter } from '@reduxjs/toolkit';
import { StageSlice } from '../stageSlice';
import { Element, ElementProps } from '../../model';
import { RootState } from '../rootState';
import { moveConnectLinePointsByDeltaStateChange, selectAllConnectLines } from '../connectLines';
import { StageState, updateStateChange } from '../stage';
import {
	createElementConnectPointsStateChange,
	createElementsConnectPointsStateChange,
	moveConnectPointsByDeltaStateChange,
} from '../connectPoints';

export interface UpdateElementPayload<P = ElementProps> {
	id: string;
	visible?: boolean;
	scale?: number;
	properties?: P;
}

export interface UpdateElementAction<P = ElementProps> {
	type: string;
	payload: UpdateElementPayload<P>;
}

export interface MoveElementPayload {
	id: string;
	x: number;
	y: number;
}

export interface MoveElementAction {
	type: string;
	payload: MoveElementPayload;
}

export interface CreateDraftElementAction {
	type: string;
	payload: Element;
}

export interface RemoveElementsPayload {
	elementIds: string[];
}

export interface RemoveElementsAction {
	type: string;
	payload: RemoveElementsPayload;
}

export interface UpdateElementPropertyPayload {
	id: string;
	propertyName: string;
	propertyValue: unknown;
}

export interface UpdateElementPropertyAction {
	type: string;
	payload: UpdateElementPropertyPayload;
}

export interface UpdateDraftElementPositionAction {
	type: string;
	payload: {
		x: number;
		y: number;
	};
}

export interface LoadElementsAction {
	type: string;
	payload: {
		elements: Element[];
	};
}

const elementsAdapter = createEntityAdapter<Element>({
	selectId: (el) => el.id,
});

export const createElementsAdapterInitialState = () => elementsAdapter.getInitialState();

export const {
	selectAll: selectAllElements,
	selectById: selectElementById,
	selectEntities: selectElementEntities,
} = elementsAdapter.getSelectors();

export const updateElementStateChange = (
	slice: Draft<StageSlice>,
	payload: UpdateElementPayload,
) => {
	slice.elements = elementsAdapter.updateOne(slice.elements, {
		id: payload.id,
		changes: payload,
	});
};

export const moveElementStateChange = (slice: Draft<StageSlice>, payload: MoveElementPayload) => {
	const el = selectElementById(slice.elements, payload.id);
	if (!el) {
		return;
	}

	slice.elements = elementsAdapter.updateOne(slice.elements, {
		id: payload.id,
		changes: {
			x: payload.x,
			y: payload.y,
		},
	});

	const dx = payload.x - el.x;
	const dy = payload.y - el.y;

	moveConnectPointsByDeltaStateChange(slice, {
		id: el.id,
		dx,
		dy,
	});

	const connectLines = selectAllConnectLines(slice.connectLines);
	connectLines.forEach((cl) => {
		if (cl.source.id === el.id) {
			moveConnectLinePointsByDeltaStateChange(slice, {
				id: cl.id,
				pointIndexes: [0, 1],
				dx,
				dy,
			});
		}

		if (cl.target.id === el.id) {
			moveConnectLinePointsByDeltaStateChange(slice, {
				id: cl.id,
				pointIndexes: [cl.points.length - 2, cl.points.length - 1],
				dx,
				dy,
			});
		}
	});
};

export const removeElementsStateChange = (
	slice: Draft<StageSlice>,
	payload: RemoveElementsPayload,
) => {
	if (payload.elementIds.length === 0) {
		return;
	}

	slice.elements = elementsAdapter.removeMany(slice.elements, payload.elementIds);
};

export const updateElementPropertyStateChange = (
	slice: Draft<StageSlice>,
	payload: UpdateElementPropertyPayload,
) => {
	const element = selectElementById(slice.elements, payload.id);
	if (!element) {
		return;
	}

	slice.elements = elementsAdapter.updateOne(slice.elements, {
		id: element.id,
		changes: {
			properties: {
				...element.properties,
				[payload.propertyName]: payload.propertyValue,
			},
		},
	});
};

export const elementsAdapterReducers = {
	updateElement: (slice: Draft<StageSlice>, action: UpdateElementAction) =>
		updateElementStateChange(slice, action.payload),
	moveElement: (slice: Draft<StageSlice>, action: MoveElementAction) =>
		moveElementStateChange(slice, action.payload),
	removeElements: (slice: Draft<StageSlice>, action: RemoveElementsAction) =>
		removeElementsStateChange(slice, action.payload),
	updateElementProperty: (slice: Draft<StageSlice>, action: UpdateElementPropertyAction) =>
		updateElementPropertyStateChange(slice, action.payload),
	createDraftElement: (slice: Draft<StageSlice>, action: CreateDraftElementAction) => {
		updateStateChange(slice, StageState.DrawElement);
		slice.draftElement = action.payload;
	},
	addDraftElement: (slice: Draft<StageSlice>) => {
		updateStateChange(slice, StageState.Select);

		if (!slice.draftElement) {
			return;
		}

		const draftEl = current<Element>(slice.draftElement);
		slice.elements = elementsAdapter.addOne(slice.elements, draftEl);
		createElementConnectPointsStateChange(slice, draftEl);
		slice.draftElement = null;
	},
	clearDraftElement: (slice: Draft<StageSlice>) => {
		updateStateChange(slice, StageState.Select);
		slice.draftElement = null;
	},
	updateDraftElementPosition: (
		slice: Draft<StageSlice>,
		action: UpdateDraftElementPositionAction,
	) => {
		if (!slice.draftElement) {
			return;
		}

		slice.draftElement = {
			...slice.draftElement,
			x: action.payload.x,
			y: action.payload.y,
		};
	},
	loadElements: (slice: Draft<StageSlice>, action: LoadElementsAction) => {
		slice.elements = elementsAdapter.addMany(slice.elements, action.payload.elements);
		createElementsConnectPointsStateChange(slice, action.payload.elements);
	},
};

const globalElementsSelector = elementsAdapter.getSelectors<RootState>(
	(state) => state.stage.elements,
);

export const selectStageElements = (state: RootState) => globalElementsSelector.selectAll(state);

export const selectStageElementById = (id: string | null) => (state: RootState) =>
	!id ? null : globalElementsSelector.selectById(state, id) ?? null;

export const selectStageDraftElement = (state: RootState) => state.stage.draftElement;

