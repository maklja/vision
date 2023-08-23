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
	selectConnectLinesReducer,
} from './reducer';
import { RootState } from './rootState';
import { ElementTooltip, hideTooltipReducer, showTooltipReducer } from './reducer/tooltipReducer';
import { createElementsAdapterInitialState, elementsAdapterReducers } from './elements';

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
	elements: EntityState<Element>;
	connectLines: ConnectLine[];
	highlightedConnectPoints: ConnectPoint[];
	selectedElements: SelectedElement[];
	selectedConnectLines: string[];
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

export interface SelectElementsAction {
	type: string;
	payload: SelectedElement[];
}

export interface HighlightElementsAction {
	type: string;
	payload: string[];
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
	elements: createElementsAdapterInitialState(),
	connectLines: [],
	highlightedConnectPoints: [],
	selectedElements: [],
	selectedConnectLines: [],
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
		...elementsAdapterReducers,
		changeState: (slice: Draft<StageSlice>, action: ChangeStateAction) => {
			slice.state = action.payload;
		},
		selectElements: (slice: Draft<StageSlice>, action: SelectElementsAction) => {
			slice.selectedElements = action.payload;
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
		clearDraftElement: clearDraftElementReducer,
		startSimulation: startSimulationReducer,
		resetSimulation: resetSimulationReducer,
		completeSimulation: completeSimulationReducer,
		addObservableEvent: addObservableEventReducer,
		removeSimulationAnimation: removeSimulationAnimationReducer,
		createElementError: createElementErrorReducer,
		clearErrors: clearErrorsReducer,
		showTooltip: showTooltipReducer,
		hideTooltip: hideTooltipReducer,
		selectConnectLines: selectConnectLinesReducer,
	},
});

export const {
	updateElement,
	moveElement,
	removeSelectedElements,
	selectElements,
	highlightElements,
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
	selectConnectLines: selectConnectLinesNew,
} = stageSlice.actions;

export default stageSlice.reducer;

export const selectDraftConnectLine = (state: RootState) => state.stage.draftConnectLine;

export const selectConnectLines = (state: RootState) => state.stage.connectLines;

export const selectConnectLineById = (id: string | null) => (state: RootState) =>
	!id ? null : state.stage.connectLines.find((cl) => cl.id === id);

export const selectStageDraftElement = (state: RootState) => state.stage.draftElement;

export const selectStageState = (state: RootState) => state.stage.state;

export const selectHighlightedConnectPointsByElementId =
	(elementId: string) => (state: RootState) =>
		state.stage.highlightedConnectPoints.filter((cp) => cp.elementId === elementId);

export const isSelectedElement = (elementId: string) => (state: RootState) =>
	state.stage.selectedElements.some(({ id }) => id === elementId);

export const selectElementSelection = (elementId: string) => (state: RootState) =>
	state.stage.selectedElements.find(({ id }) => id === elementId) ?? null;

export const isSelectedConnectLine = (connectLineId: string) => (state: RootState) =>
	state.stage.selectedConnectLines.some(
		(currentConnectLineId) => currentConnectLineId === connectLineId,
	);

export const isHighlighted = (elementId: string) => (state: RootState) =>
	state.stage.highlighted.some((currentElementId) => currentElementId === elementId);

export const selectSimulation = (state: RootState) => state.stage.simulation;

export const selectSimulationNextAnimation = (state: RootState): SimulationAnimation | null =>
	state.stage.simulation.animationsQueue.at(0) ?? null;

