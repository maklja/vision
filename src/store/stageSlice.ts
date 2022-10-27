import { createSlice, Draft } from '@reduxjs/toolkit';
import { ConnectLine, Element, ElementType, FromElement, OfElement } from '../model';
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
	drawers: Element[];
	connectLines: ConnectLine[];
	connectPoints: unknown[];
	selected: string[];
	highlighted: string[];
	state: StageState;
	draftConnectLineId: string | null;
}

export interface AddDrawersAction {
	type: string;
	payload: Element[];
}

export interface SelectDrawersAction {
	type: string;
	payload: string[];
}

export interface HighlightDrawersAction {
	type: string;
	payload: string[];
}

export interface MoveDrawerAction {
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

const e1: OfElement = {
	id: 'test',
	size: 1,
	x: 50,
	y: 50,
	items: [4, 3, 2, 1],
	type: ElementType.Of,
};

const e2: Element = {
	id: 'test1',
	size: 1,
	x: 240,
	y: 240,
	type: ElementType.Subscriber,
};

const e3: FromElement = {
	id: 'fromElement',
	size: 1,
	x: 300,
	y: 300,
	type: ElementType.From,
	input: [3, 3, 3, 4],
};

const e4: Element = {
	id: 'filterElement',
	size: 1,
	x: 500,
	y: 300,
	type: ElementType.Filter,
};

const initialState: StageSlice = {
	drawers: [e1, e2, e3, e4],
	connectLines: [],
	connectPoints: [],
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
		addDrawers: (slice: Draft<StageSlice>, action: AddDrawersAction) => {
			slice.drawers = action.payload;
		},
		selectDrawers: (slice: Draft<StageSlice>, action: SelectDrawersAction) => {
			slice.selected = action.payload;
		},
		highlightDrawers: (slice: Draft<StageSlice>, action: HighlightDrawersAction) => {
			slice.highlighted = action.payload;
		},
		removeHighlightDrawers: (slice: Draft<StageSlice>, action: HighlightDrawersAction) => {
			slice.highlighted = slice.highlighted.filter(
				(drawerId) => !action.payload.includes(drawerId),
			);
		},
		startConnectLineDraw: startConnectLineDrawReducer,
		moveConnectLineDraw: moveConnectLineDrawReducer,
		linkConnectLineDraw: linkConnectLineDrawReducer,
		deleteConnectLineDraw: deleteConnectLineDrawReducer,
		pinConnectLine: pinConnectLineReducer,
		unpinConnectLine: unpinConnectLineReducer,
		moveDrawer: (state: Draft<StageSlice>, action: MoveDrawerAction) => {
			const { payload } = action;
			const drawerIdx = state.drawers.findIndex((drawer) => drawer.id === payload.id);
			if (drawerIdx === -1) {
				return;
			}

			const drawer = state.drawers[drawerIdx];
			const dx = payload.x - drawer.x;
			const dy = payload.y - drawer.y;
			state.drawers[drawerIdx] = {
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
	addDrawers,
	selectDrawers,
	highlightDrawers,
	removeHighlightDrawers,
	moveDrawer,
	changeState,
	startConnectLineDraw,
	moveConnectLineDraw,
	linkConnectLineDraw,
	deleteConnectLineDraw,
	pinConnectLine,
	unpinConnectLine,
} = stageSlice.actions;

export default stageSlice.reducer;

export const selectStageState = (state: RootState) => state.stage.state;

export const selectHighlightedConnectPointsByElementId =
	(elementId: string) => (state: RootState) =>
		state.connectPoints.highlighted.filter((cp) => cp.elementId === elementId);

export const isSelectedElement = (elementId: string) => (state: RootState) =>
	state.stage.selected.some((currentElementId) => currentElementId === elementId);

export const isHighlightedElement = (elementId: string) => (state: RootState) =>
	state.stage.highlighted.some((currentElementId) => currentElementId === elementId);

