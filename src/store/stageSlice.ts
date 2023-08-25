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
	removeSelectedElementsReducer,
	selectConnectLinesReducer,
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
	DraftConnectLine,
} from './connectLines';

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
	connectLines: EntityState<ConnectLine>;
	draftConnectLine: DraftConnectLine | null;
	highlightedConnectPoints: ConnectPoint[];
	selectedConnectLines: string[];
	highlighted: string[];
	state: StageState;
	draftElement: Element | null;
	simulation: Simulation;
	themes: ThemesContext;
	elementSizes: ElementSizesContext;
	errors: EntityState<ElementError>;
	tooltip: ElementTooltip | null;
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

export const createStageInitialState = (elements: Element[] = []): StageSlice => ({
	elements: createElementsAdapterInitialState(elements),
	selectedElements: createSelectedElementsAdapterInitialState(),
	draftElement: null,
	connectLines: createConnectLinesAdapterInitialState(),
	draftConnectLine: null,
	highlightedConnectPoints: [],
	selectedConnectLines: [],
	highlighted: [],
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
		changeState: (slice: Draft<StageSlice>, action: ChangeStateAction) => {
			slice.state = action.payload;
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

export const selectStageState = (state: RootState) => state.stage.state;

export const selectHighlightedConnectPointsByElementId =
	(elementId: string) => (state: RootState) =>
		state.stage.highlightedConnectPoints.filter((cp) => cp.elementId === elementId);

export const isSelectedConnectLine = (connectLineId: string) => (state: RootState) =>
	state.stage.selectedConnectLines.some(
		(currentConnectLineId) => currentConnectLineId === connectLineId,
	);

export const isHighlighted = (elementId: string) => (state: RootState) =>
	state.stage.highlighted.some((currentElementId) => currentElementId === elementId);

export const selectSimulation = (state: RootState) => state.stage.simulation;

export const selectSimulationNextAnimation = (state: RootState): SimulationAnimation | null =>
	state.stage.simulation.animationsQueue.at(0) ?? null;

