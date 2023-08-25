import { Draft, createEntityAdapter } from '@reduxjs/toolkit';
import { StageSlice, StageState } from '../stageSlice';
import { Element } from '../../model';
import { RootState } from '../rootState';

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

const elementsAdapter = createEntityAdapter<Element>({
	selectId: (el) => el.id,
});

export const createElementsAdapterInitialState = (elements: Element[] = []) =>
	elementsAdapter.addMany(elementsAdapter.getInitialState(), elements);

export const updateElement = (slice: Draft<StageSlice>, payload: UpdateElementPayload) => {
	slice.elements = elementsAdapter.updateOne(slice.elements, {
		id: payload.id,
		changes: payload,
	});
};

export const moveElement = (slice: Draft<StageSlice>, payload: MoveElementPayload) => {
	slice.elements = elementsAdapter.updateOne(slice.elements, {
		id: payload.id,
		changes: payload,
	});

	const el = slice.elements.entities[payload.id];
	if (!el) {
		return;
	}

	const dx = payload.x - el.x;
	const dy = payload.y - el.y;
	slice.connectLines.forEach((cl) => {
		if (cl.source.id === el.id) {
			const [p0, p1] = cl.points;
			p0.x += dx;
			p0.y += dy;
			p1.x += dx;
			p1.y += dy;
		}

		if (cl.target.id === el.id) {
			const [p0, p1] = cl.points.slice(-2);
			p0.x += dx;
			p0.y += dy;
			p1.x += dx;
			p1.y += dy;
		}
	});
};

export const elementsAdapterReducers = {
	updateElement: (slice: Draft<StageSlice>, action: UpdateElementAction) =>
		updateElement(slice, action.payload),
	moveElement: (slice: Draft<StageSlice>, action: MoveElementAction) =>
		moveElement(slice, action.payload),
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

export const { selectAll: selectAllElements, selectById: selectElementById } =
	elementsAdapter.getSelectors();

const globalElementsSelector = elementsAdapter.getSelectors<RootState>(
	(state) => state.stage.elements,
);

export const selectStageElements = (state: RootState) => globalElementsSelector.selectAll(state);

export const selectStageElementById = (id: string | null) => (state: RootState) =>
	!id ? null : globalElementsSelector.selectById(state, id) ?? null;
