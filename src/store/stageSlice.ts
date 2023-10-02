import { createSlice, EntityState } from '@reduxjs/toolkit';
import { ConnectLine, Element, SnapLine } from '../model';
import {
	createThemeContext,
	ThemesContext,
	ElementSizesContext,
	createElementSizesContext,
} from '../theme';
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
import { createErrorsAdapterInitialState, ElementError, errorReducers } from './errors';
import { createSnapLinesInitialState, snapLineReducers } from './snapLines';
import {
	connectPointsAdapterReducers,
	createConnectPointsAdapterInitialState,
	createHighlightedConnectPointsAdapterInitialState,
	ElementConnectPoints,
	ElementConnectPointsX,
	highlightedConnectPointsAdapterReducers,
} from './connectPoints';
import {
	createDrawerAnimationsInitialState,
	DrawerAnimations,
	drawerAnimationsAdapterReducers,
} from './drawerAnimations';

export * from './hooks/theme';

export interface StageSlice {
	elements: EntityState<Element>;
	selectedElements: EntityState<SelectedElement>;
	draftElement: Element | null;
	connectLines: EntityState<ConnectLine>;
	selectedConnectLines: EntityState<SelectedConnectLine>;
	draftConnectLine: DraftConnectLine | null;
	connectPoints: EntityState<ElementConnectPointsX>;
	highlighted: EntityState<HighlightElement>;
	highlightedConnectPoints: EntityState<ElementConnectPoints>;
	state: StageState;
	simulation: Simulation;
	themes: ThemesContext;
	elementSizes: ElementSizesContext;
	errors: EntityState<ElementError>;
	tooltip: ElementTooltip | null;
	snapLines: SnapLine[];
	animations: EntityState<DrawerAnimations>;
}

export const createStageInitialState = (): StageSlice => ({
	elements: createElementsAdapterInitialState(),
	selectedElements: createSelectedElementsAdapterInitialState(),
	draftElement: null,
	connectLines: createConnectLinesAdapterInitialState(),
	selectedConnectLines: createSelectedConnectLinesAdapterInitialState(),
	draftConnectLine: null,
	connectPoints: createConnectPointsAdapterInitialState(),
	highlightedConnectPoints: createHighlightedConnectPointsAdapterInitialState(),
	highlighted: createHighlightedAdapterInitialState(),
	state: StageState.Select,
	simulation: createSimulationInitialState(),
	themes: createThemeContext(),
	elementSizes: createElementSizesContext(),
	errors: createErrorsAdapterInitialState(),
	tooltip: null,
	snapLines: createSnapLinesInitialState(),
	animations: createDrawerAnimationsInitialState(),
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
		...errorReducers,
		...snapLineReducers,
		...highlightedConnectPointsAdapterReducers,
		...drawerAnimationsAdapterReducers,
		...connectPointsAdapterReducers,
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
	createSnapLines,
	clearSnapLines,
	updateDraftElementPosition,
	createDraftElementSnapLines,
	addDrawerAnimation,
	clearHighlightedConnectPoints,
	disposeDrawerAnimation,
	refreshDrawerAnimation,
	removeAllDrawerAnimation,
	removeDrawerAnimation,
	createElementConnectPoints,
	loadElements,
	moveConnectPointsByDelta,
	removeConnectPointsByIds,
	setSelectionConnectPoints,
	updateManyConnectPoints,
} = stageSlice.actions;

export default stageSlice.reducer;

