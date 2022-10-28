import { createSlice, Draft } from '@reduxjs/toolkit';
import { ConnectLine, ConnectPoint, Element, ElementType, FromElement, OfElement } from '../model';
import {
	startConnectLineDrawReducer,
	moveConnectLineDrawReducer,
	linkConnectLineDrawReducer,
	deleteConnectLineDrawReducer,
	pinConnectLineReducer,
	unpinConnectLineReducer,
} from './reducer';
import { RootState } from './rootState';

export enum StageState {
	Select = 'select',
	DrawConnectLine = 'drawConnectLine',
	Dragging = 'dragging',
}

export interface StageSlice {
	elements: Element[];
	connectLines: ConnectLine[];
	highlightedConnectPoints: ConnectPoint[];
	selected: string[];
	highlighted: string[];
	state: StageState;
	draftConnectLineId: string | null;
}

export interface AddElementsAction {
	type: string;
	payload: Element[];
}

export interface SelectElementsAction {
	type: string;
	payload: string[];
}

export interface HighlightElementsAction {
	type: string;
	payload: string[];
}

export interface MoveElementAction {
	type: string;
	payload: {
		id: string;
		x: number;
		y: number;
	};
}

export interface ChangeStateAction {
	type: string;
	payload: StageState;
}

export interface HighlightConnectPointsAction {
	type: string;
	payload: ConnectPoint[];
}

const e1: OfElement = {
	id: 'ofElement',
	size: 1,
	x: 50,
	y: 50,
	items: [4, 3, 2, 1],
	type: ElementType.Of,
};

const e3: FromElement = {
	id: 'fromElement',
	size: 1,
	x: 50,
	y: 200,
	type: ElementType.From,
	input: [3, 3, 3, 4],
};

const e4: Element = {
	id: 'filterElement',
	size: 1,
	x: 200,
	y: 125,
	type: ElementType.Filter,
};

const e2: Element = {
	id: 'subscriber',
	size: 1,
	x: 300,
	y: 125,
	type: ElementType.Subscriber,
};

const initialState: StageSlice = {
	elements: [e1, e2, e3, e4],
	connectLines: [],
	highlightedConnectPoints: [],
	selected: [],
	highlighted: [],
	state: StageState.Select,
	draftConnectLineId: null,
};

export const stageSlice = createSlice({
	name: 'stage',
	initialState: initialState,
	reducers: {
		changeState: (slice: Draft<StageSlice>, action: ChangeStateAction) => {
			slice.state = action.payload;
		},
		addElements: (slice: Draft<StageSlice>, action: AddElementsAction) => {
			slice.elements = action.payload;
		},
		selectElements: (slice: Draft<StageSlice>, action: SelectElementsAction) => {
			slice.selected = action.payload;
		},
		highlightElements: (slice: Draft<StageSlice>, action: HighlightElementsAction) => {
			slice.highlighted = action.payload;
		},
		highlightConnectPoints: (
			slice: Draft<StageSlice>,
			action: HighlightConnectPointsAction,
		) => {
			slice.highlightedConnectPoints = action.payload;
		},
		startConnectLineDraw: startConnectLineDrawReducer,
		moveConnectLineDraw: moveConnectLineDrawReducer,
		linkConnectLineDraw: linkConnectLineDrawReducer,
		deleteConnectLineDraw: deleteConnectLineDrawReducer,
		pinConnectLine: pinConnectLineReducer,
		unpinConnectLine: unpinConnectLineReducer,
		moveDrawer: (state: Draft<StageSlice>, action: MoveElementAction) => {
			const { payload } = action;
			const elIdx = state.elements.findIndex((el) => el.id === payload.id);
			if (elIdx === -1) {
				return;
			}

			const drawer = state.elements[elIdx];
			const dx = payload.x - drawer.x;
			const dy = payload.y - drawer.y;
			state.elements[elIdx] = {
				...drawer,
				x: payload.x,
				y: payload.y,
			};

			state.connectLines.forEach((cl) => {
				if (cl.sourceId === drawer.id) {
					const [p0, p1] = cl.points;
					p0.x += dx;
					p0.y += dy;
					p1.x += dx;
					p1.y += dy;
				}

				if (cl.targetId === drawer.id) {
					const [p0, p1] = cl.points.slice(-2);
					p0.x += dx;
					p0.y += dy;
					p1.x += dx;
					p1.y += dy;
				}
			});
		},
	},
});

export const {
	addElements,
	selectElements,
	highlightElements,
	moveDrawer,
	changeState,
	startConnectLineDraw,
	moveConnectLineDraw,
	linkConnectLineDraw,
	deleteConnectLineDraw,
	pinConnectLine,
	unpinConnectLine,
	highlightConnectPoints,
} = stageSlice.actions;

export default stageSlice.reducer;

export const selectStageState = (state: RootState) => state.stage.state;

export const selectHighlightedConnectPointsByElementId =
	(elementId: string) => (state: RootState) =>
		state.stage.highlightedConnectPoints.filter((cp) => cp.elementId === elementId);

export const isSelectedElement = (elementId: string) => (state: RootState) =>
	state.stage.selected.some((currentElementId) => currentElementId === elementId);

export const isHighlightedElement = (elementId: string) => (state: RootState) =>
	state.stage.highlighted.some((currentElementId) => currentElementId === elementId);

