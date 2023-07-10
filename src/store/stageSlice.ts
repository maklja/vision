import { createSlice, Draft } from '@reduxjs/toolkit';
import {
	ConnectLine,
	ConnectPoint,
	ConnectPointTypeVisibility,
	Element,
	Point,
	ConnectedElement,
} from '../model';
import { createThemeContext, ThemesContext } from '../theme';
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
	source: ConnectedElement;
	points: Point[];
	locked: boolean;
}

export interface SelectedElement {
	id: string;
	visibleConnectPoints: ConnectPointTypeVisibility;
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
	selected: SelectedElement[];
	highlighted: string[];
	themes: ThemesContext;
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

export interface RemoveElementAction {
	type: string;
	payload: {
		id: string;
	};
}

export interface UpdateElementAction<P = unknown> {
	type: string;
	payload: {
		id: string;
		visible?: boolean;
		size?: number;
		properties?: P;
	};
}

export interface SelectElementsAction {
	type: string;
	payload: SelectedElement[];
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
	themes: createThemeContext(),
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
		removeElement: (slice: Draft<StageSlice>, action: RemoveElementAction) => {
			slice.elements = slice.elements.filter((el) => el.id !== action.payload.id);
		},
		updateElement: (slice: Draft<StageSlice>, action: UpdateElementAction) => {
			const { payload } = action;
			const elIdx = slice.elements.findIndex((el) => el.id === payload.id);
			if (elIdx === -1) {
				return;
			}

			const el = slice.elements[elIdx];
			slice.elements[elIdx] = {
				...el,
				size: payload.size ?? el.size,
				visible: payload.visible ?? el.visible,
				properties: payload.properties ?? el.properties,
			};
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
		moveElement: (state: Draft<StageSlice>, action: MoveElementAction) => {
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
				if (cl.source.id === drawer.id) {
					const [p0, p1] = cl.points;
					p0.x += dx;
					p0.y += dy;
					p1.x += dx;
					p1.y += dy;
				}

				if (cl.target.id === drawer.id) {
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
	removeElement,
	updateElement,
	addElements,
	selectElements,
	highlightElements,
	moveElement,
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
	state.stage.selected.some(({ id }) => id === elementId);

export const selectElementSelection = (elementId: string) => (state: RootState) =>
	state.stage.selected.find(({ id }) => id === elementId) ?? null;

export const isHighlightedElement = (elementId: string) => (state: RootState) =>
	state.stage.highlighted.some((currentElementId) => currentElementId === elementId);

