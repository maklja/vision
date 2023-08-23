import { Draft, createEntityAdapter } from '@reduxjs/toolkit';
import { StageSlice, StageState } from '../stageSlice';
import { Element } from '../../model';
import { RootState } from '../rootState';

export interface UpdateElementAction<P = unknown> {
	type: string;
	payload: {
		id: string;
		visible?: boolean;
		scale?: number;
		properties?: P;
	};
}

export interface MoveElementAction {
	type: string;
	payload: {
		id: string;
		x: number;
		y: number;
	};
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

export const createElementsAdapterInitialState = () => elementsAdapter.getInitialState();

export const elementsAdapterReducers = {
	updateElement: (slice: Draft<StageSlice>, action: UpdateElementAction) => {
		const { payload } = action;

		slice.elements = elementsAdapter.updateOne(slice.elements, {
			id: payload.id,
			changes: payload,
		});
	},
	moveElement: (slice: Draft<StageSlice>, action: MoveElementAction) => {
		const { payload } = action;

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
	},
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
};

const elementsSelector = elementsAdapter.getSelectors<RootState>((state) => state.stage.elements);

export const selectStageElements = (state: RootState) => elementsSelector.selectAll(state);

export const selectStageElementById = (id: string | null) => (state: RootState) =>
	!id ? null : elementsSelector.selectById(state, id) ?? null;

