import { v1 } from 'uuid';
import { createSlice, Draft, EntityState } from '@reduxjs/toolkit';
import { ConnectLine, ConnectPoint, Element } from '../model';
import {
	createThemeContext,
	ThemesContext,
	ElementSizesContext,
	createElementSizesContext,
} from '../theme';
import {
	pinConnectLineReducer,
	unpinConnectLineReducer,
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
} from './reducer';
import { RootState } from './rootState';
import { ElementTooltip, hideTooltipReducer, showTooltipReducer } from './reducer/tooltipReducer';
import {
	createElementsAdapterInitialState,
	elementsAdapterReducers,
	SelectedElement,
	createSelectedElementsAdapterInitialState,
	selectElementsAdapterReducers,
} from './elements';
import {
	connectLinesAdapterReducers,
	createConnectLinesAdapterInitialState,
	createSelectedConnectLinesAdapterInitialState,
	DraftConnectLine,
	selectConnectLinesAdapterReducers,
	SelectedConnectLine,
} from './connectLines';
import { selectReducers } from './select';
import {
	createHighlightedAdapterInitialState,
	HighlightElement,
	selectHighlighAdapterReducers,
} from './highlight';

export * from './hooks/theme';

export type { ObservableEvent } from './reducer';
export { SimulationState, errorsAdapter, selectElementErrorById, selectTooltip } from './reducer';

export enum StageState {
	Select = 'select',
	DrawConnectLine = 'drawConnectLine',
	Dragging = 'dragging',
	DrawElement = 'drawElement',
}

export interface StageSlice {
	elements: EntityState<Element>;
	selectedElements: EntityState<SelectedElement>;
	draftElement: Element | null;
	connectLines: EntityState<ConnectLine>;
	selectedConnectLines: EntityState<SelectedConnectLine>;
	draftConnectLine: DraftConnectLine | null;
	highlighted: EntityState<HighlightElement>;
	highlightedConnectPoints: ConnectPoint[];
	state: StageState;
	simulation: Simulation;
	themes: ThemesContext;
	elementSizes: ElementSizesContext;
	errors: EntityState<ElementError>;
	tooltip: ElementTooltip | null;
}

export interface ChangeStateAction {
	type: string;
	payload: StageState;
}

export interface HighlightConnectPointsAction {
	type: string;
	payload: ConnectPoint[];
}

export const createStageInitialState = (elements: Element[] = []): StageSlice => ({
	elements: createElementsAdapterInitialState(elements),
	selectedElements: createSelectedElementsAdapterInitialState(),
	draftElement: null,
	connectLines: createConnectLinesAdapterInitialState(),
	selectedConnectLines: createSelectedConnectLinesAdapterInitialState(),
	draftConnectLine: null,
	highlightedConnectPoints: [],
	highlighted: createHighlightedAdapterInitialState(),
	state: StageState.Select,
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
});

export const stageSlice = createSlice({
	name: 'stage',
	initialState: createStageInitialState(),
	reducers: {
		...elementsAdapterReducers,
		...selectElementsAdapterReducers,
		...connectLinesAdapterReducers,
		...selectConnectLinesAdapterReducers,
		...selectReducers,
		...selectHighlighAdapterReducers,
		changeState: (slice: Draft<StageSlice>, action: ChangeStateAction) => {
			slice.state = action.payload;
		},
		highlightConnectPoints: (
			slice: Draft<StageSlice>,
			action: HighlightConnectPointsAction,
		) => {
			slice.highlightedConnectPoints = action.payload;
		},
		pinConnectLine: pinConnectLineReducer,
		unpinConnectLine: unpinConnectLineReducer,
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
	moveElement,
	selectElements,
	removeSelected,
	highlight,
	changeState,
	startConnectLineDraw,
	moveConnectLineDraw,
	linkConnectLineDraw,
	addNextPointConnectLineDraw,
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
	selectConnectLines,
	moveConnectLinePointsByDelta,
	removeConnectLines,
	removeElements,
	clearSelected,
} = stageSlice.actions;

export default stageSlice.reducer;

export const selectStageState = (state: RootState) => state.stage.state;

export const selectHighlightedConnectPointsByElementId =
	(elementId: string) => (state: RootState) =>
		state.stage.highlightedConnectPoints.filter((cp) => cp.elementId === elementId);

export const selectSimulation = (state: RootState) => state.stage.simulation;

export const selectSimulationNextAnimation = (state: RootState): SimulationAnimation | null =>
	state.stage.simulation.animationsQueue.at(0) ?? null;

