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
	ElementError,
	errorsAdapter,
	createElementErrorReducer,
	clearErrorsReducer,
} from './reducer';
import { RootState } from './rootState';
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
import { createSimulationInitialState, Simulation, simulationReducers } from './simulation';
import { StageState, stageReducers } from './stage';
import { ElementTooltip, tooltipReducers } from './tooltip';

export * from './hooks/theme';

export { errorsAdapter, selectElementErrorById } from './reducer';

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
	simulation: createSimulationInitialState(),
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
		...simulationReducers,
		...stageReducers,
		...tooltipReducers,
		highlightConnectPoints: (
			slice: Draft<StageSlice>,
			action: HighlightConnectPointsAction,
		) => {
			slice.highlightedConnectPoints = action.payload;
		},
		pinConnectLine: pinConnectLineReducer,
		unpinConnectLine: unpinConnectLineReducer,
		createElementError: createElementErrorReducer,
		clearErrors: clearErrorsReducer,
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
	movePointConnectLine,
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
	updateElementProperty,
	removeElementConnectLines,
} = stageSlice.actions;

export default stageSlice.reducer;

export const selectHighlightedConnectPointsByElementId =
	(elementId: string) => (state: RootState) =>
		state.stage.highlightedConnectPoints.filter((cp) => cp.elementId === elementId);

