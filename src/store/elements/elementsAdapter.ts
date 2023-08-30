import { Draft, createEntityAdapter } from '@reduxjs/toolkit';
import { StageSlice, StageState } from '../stageSlice';
import { Element } from '../../model';
import { RootState } from '../rootState';
import { moveConnectLinePointsByDeltaStateChange, selectAllConnectLines } from '../connectLines';

export interface UpdateElementPayload<P = unknown> {
	id: string;
	visible?: boolean;
	scale?: number;
	properties?: P;
}

export interface UpdateElementAction<P = unknown> {
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

export interface AddDraftElementAction {
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

const elementsAdapter = createEntityAdapter<Element>({
	selectId: (el) => el.id,
});

export const createElementsAdapterInitialState = (elements: Element[] = []) =>
	elementsAdapter.addMany(elementsAdapter.getInitialState(), elements);

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
		changes: payload,
	});

	const dx = payload.x - el.x;
	const dy = payload.y - el.y;

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
				...element,
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
		slice.state = StageState.DrawElement;
		slice.draftElement = action.payload;
	},
	addDraftElement: (slice: Draft<StageSlice>, action: AddDraftElementAction) => {
		slice.state = StageState.Select;

		if (!slice.draftElement) {
			return;
		}

		slice.elements = elementsAdapter.addOne(slice.elements, action.payload);
		slice.draftElement = null;
	},
	clearDraftElement: (slice: Draft<StageSlice>) => {
		slice.state = StageState.Select;
		slice.draftElement = null;
	},
};

const globalElementsSelector = elementsAdapter.getSelectors<RootState>(
	(state) => state.stage.elements,
);

export const selectStageElements = (state: RootState) => globalElementsSelector.selectAll(state);

export const selectStageElementById = (id: string | null) => (state: RootState) =>
	!id ? null : globalElementsSelector.selectById(state, id) ?? null;

export const selectStageDraftElement = (state: RootState) => state.stage.draftElement;

