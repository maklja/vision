import { v1 } from 'uuid';
import { createSlice, Draft, EntityState } from '@reduxjs/toolkit';
import {
	ConnectLine,
	ConnectPoint,
	ConnectPointTypeVisibility,
	Element,
	Point,
	ConnectedElement,
} from '../model';
import {
	createThemeContext,
	ThemesContext,
	ElementSizesContext,
	createElementSizesContext,
} from '../theme';
import {
	startConnectLineDrawReducer,
	moveConnectLineDrawReducer,
	linkConnectLineDrawReducer,
	deleteConnectLineDrawReducer,
	pinConnectLineReducer,
	unpinConnectLineReducer,
	createDraftElementReducer,
	addDraftElementReducer,
	clearDraftElementReducer,
	resetSimulationReducer,
	completeSimulationReducer,
	addObservableEventReducer,
	Simulation,
	SimulationAnimation,
	removeSimulationAnimationReducer,
	SimulationState,
	startSimulationReducer,
	ElementError,
	errorsAdapter,
	createElementErrorReducer,
	clearErrorsReducer,
	removeSelectedElementsReducer,
} from './reducer';
import { RootState } from './rootState';
import { ElementTooltip, hideTooltipReducer, showTooltipReducer } from './reducer/tooltipReducer';

export * from './hooks/theme';

export type { ObservableEvent } from './reducer';
export { SimulationState, errorsAdapter, selectElementErrorById, selectTooltip } from './reducer';

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
	DrawElement = 'drawElement',
}

export interface StageSlice {
	elements: Element[];
	connectLines: ConnectLine[];
	highlightedConnectPoints: ConnectPoint[];
	selected: SelectedElement[];
	highlighted: string[];
	state: StageState;
	draftConnectLine: DraftConnectLine | null;
	draftElement: Element | null;
	simulation: Simulation;
	themes: ThemesContext;
	elementSizes: ElementSizesContext;
	errors: EntityState<ElementError>;
	tooltip: ElementTooltip | null;
}

export interface AddElementsAction {
	type: string;
	payload: Element[];
}

export interface UpdateElementAction<P = unknown> {
	type: string;
	payload: {
		id: string;
		visible?: boolean;
		scale?: number;
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
	state: StageState.Select,
	draftConnectLine: null,
	draftElement: null,
	simulation: {
		id: v1(),
		state: SimulationState.Stopped,
		completed: false,
		animationsQueue: [],
		events: [],
	},
	themes: createThemeContext(),
	elementSizes: createElementSizesContext(),
	errors: errorsAdapter.getInitialState(),
	tooltip: null,
};

export const stageSlice = createSlice({
	name: 'stage',
	initialState: initialState,
	reducers: {
		changeState: (slice: Draft<StageSlice>, action: ChangeStateAction) => {
			slice.state = action.payload;
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
				scale: payload.scale ?? el.scale,
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
		removeSelectedElements: removeSelectedElementsReducer,
		startConnectLineDraw: startConnectLineDrawReducer,
		moveConnectLineDraw: moveConnectLineDrawReducer,
		linkConnectLineDraw: linkConnectLineDrawReducer,
		deleteConnectLineDraw: deleteConnectLineDrawReducer,
		pinConnectLine: pinConnectLineReducer,
		unpinConnectLine: unpinConnectLineReducer,
		createDraftElement: createDraftElementReducer,
		addDraftElement: addDraftElementReducer,
		clearDraftElement: clearDraftElementReducer,
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
		startSimulation: startSimulationReducer,
		resetSimulation: resetSimulationReducer,
		completeSimulation: completeSimulationReducer,
		addObservableEvent: addObservableEventReducer,
		removeSimulationAnimation: removeSimulationAnimationReducer,
		createElementError: createElementErrorReducer,
		clearErrors: clearErrorsReducer,
		showTooltip: showTooltipReducer,
		hideTooltip: hideTooltipReducer,
	},
});

export const {
	updateElement,
	removeSelectedElements,
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
	createDraftElement,
	addDraftElement,
	clearDraftElement,
	startSimulation,
	resetSimulation,
	completeSimulation,
	addObservableEvent,
	removeSimulationAnimation,
	createElementError,
	clearErrors,
	showTooltip,
	hideTooltip,
} = stageSlice.actions;

export default stageSlice.reducer;

export const selectStage = (state: RootState) => state.stage;

export const selectDraftConnectLine = (state: RootState) => state.stage.draftConnectLine;

export const selectConnectLines = (state: RootState) => state.stage.connectLines;

export const selectConnectLineById = (id: string | null) => (state: RootState) =>
	!id ? null : state.stage.connectLines.find((cl) => cl.id === id);

export const selectStageElements = (state: RootState) => state.stage.elements;

export const selectStageElementById = (id: string | null) => (state: RootState) =>
	!id ? null : state.stage.elements.find((el) => el.id === id) ?? null;

export const selectStageDraftElement = (state: RootState) => state.stage.draftElement;

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

export const selectSimulation = (state: RootState) => state.stage.simulation;

export const selectSimulationNextAnimation = (state: RootState): SimulationAnimation | null =>
	state.stage.simulation.animationsQueue.at(0) ?? null;

