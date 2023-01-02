import { createSlice, Draft } from '@reduxjs/toolkit';
import { ConnectLine, ConnectPoint, Element, Point } from '../model';
import { createThemeContext, ThemeContext } from '../theme';
import {
	startConnectLineDrawReducer,
	moveConnectLineDrawReducer,
	linkConnectLineDrawReducer,
	deleteConnectLineDrawReducer,
	pinConnectLineReducer,
	unpinConnectLineReducer,
} from './reducer';
import { RootState } from './rootState';

export * from './hooks/theme';

export interface DraftConnectLine {
	id: string;
	sourceId: string;
	points: Point[];
	locked: boolean;
}

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
	theme: ThemeContext;
	state: StageState;
	draftConnectLine: DraftConnectLine | null;
}

export interface AddElementsAction {
	type: string;
	payload: Element[];
}

export interface AddElementAction {
	type: string;
	payload: Element;
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

const initialState: StageSlice = {
	elements: [],
	connectLines: [],
	highlightedConnectPoints: [],
	selected: [],
	highlighted: [],
	theme: createThemeContext(),
	state: StageState.Select,
	draftConnectLine: null,
};

export const stageSlice = createSlice({
	name: 'stage',
	initialState: initialState,
	reducers: {
		changeState: (slice: Draft<StageSlice>, action: ChangeStateAction) => {
			slice.state = action.payload;
		},
		addElement: (slice: Draft<StageSlice>, action: AddElementAction) => {
			slice.elements = [...slice.elements, action.payload];
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
	addElement,
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

export const selectStage = (state: RootState) => state.stage;

export const selectDraftConnectLine = (state: RootState) => state.stage.draftConnectLine;

export const selectConnectLines = (state: RootState) => state.stage.connectLines;

export const selectConnectLineById = (id: string | null) => (state: RootState) =>
	!id ? null : state.stage.connectLines.find((cl) => cl.id === id);

export const selectStageElements = (state: RootState) => state.stage.elements;

export const selectStageState = (state: RootState) => state.stage.state;

export const selectHighlightedConnectPointsByElementId =
	(elementId: string) => (state: RootState) =>
		state.stage.highlightedConnectPoints.filter((cp) => cp.elementId === elementId);

export const isSelectedElement = (elementId: string) => (state: RootState) =>
	state.stage.selected.some((currentElementId) => currentElementId === elementId);

export const isHighlightedElement = (elementId: string) => (state: RootState) =>
	state.stage.highlighted.some((currentElementId) => currentElementId === elementId);
