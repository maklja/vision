import { createSlice, EntityState } from '@reduxjs/toolkit';
import { Element, IBoundingBox, SnapLine } from '../model';
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
	ConnectLineEntity,
	connectLinesAdapterReducers,
	createConnectLinesAdapterInitialState,
	DraftConnectLine,
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
	ElementConnectPoints,
} from './connectPoints';
import {
	createDrawerAnimationsInitialState,
	DrawerAnimations,
	drawerAnimationsAdapterReducers,
} from './drawerAnimations';
import { CanvasState, canvasStateReducers, createCanvasInitialState } from './canvas';

export * from './hooks/theme';

export interface StageSlice {
	elements: EntityState<Element>;
	selectedElements: EntityState<SelectedElement>;
	draftElement: Element | null;
	lassoSelection: IBoundingBox | null;
	connectLines: EntityState<ConnectLineEntity>;
	draftConnectLine: DraftConnectLine | null;
	connectPoints: EntityState<ElementConnectPoints>;
	highlighted: EntityState<HighlightElement>;
	state: StageState;
	simulation: Simulation;
	themes: ThemesContext;
	elementSizes: ElementSizesContext;
	errors: EntityState<ElementError>;
	tooltip: ElementTooltip | null;
	snapLines: SnapLine[];
	animations: EntityState<DrawerAnimations>;
	canvasState: CanvasState;
}

export const createStageInitialState = (): StageSlice => ({
	elements: createElementsAdapterInitialState(),
	selectedElements: createSelectedElementsAdapterInitialState(),
	draftElement: null,
	connectLines: createConnectLinesAdapterInitialState(),
	draftConnectLine: null,
	connectPoints: createConnectPointsAdapterInitialState(),
	highlighted: createHighlightedAdapterInitialState(),
	state: StageState.Select,
	simulation: createSimulationInitialState(),
	themes: createThemeContext(),
	elementSizes: createElementSizesContext(),
	errors: createErrorsAdapterInitialState(),
	tooltip: null,
	snapLines: createSnapLinesInitialState(),
	animations: createDrawerAnimationsInitialState(),
	canvasState: createCanvasInitialState(),
	lassoSelection: null,
});

export const stageSlice = createSlice({
	name: 'stage',
	initialState: createStageInitialState(),
	reducers: {
		...elementsAdapterReducers,
		...selectElementsAdapterReducers,
		...connectLinesAdapterReducers,
		...selectReducers,
		...selectHighlighAdapterReducers,
		...simulationReducers,
		...stageReducers,
		...tooltipReducers,
		...errorReducers,
		...snapLineReducers,
		...drawerAnimationsAdapterReducers,
		...connectPointsAdapterReducers,
		...canvasStateReducers,
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
	createElementSnapLines,
	clearSnapLines,
	updateDraftElementPosition,
	createDraftElementSnapLines,
	addDrawerAnimation,
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
	clearHighlighConnectPoints,
	createConnectPointSnapLines,
	updateConnectLine,
	updateCanvasState,
	addElementsToSelection,
	moveSelectedElementsByDelta,
	toggleSelectElement,
	selectElement,
	toggleSelectionConnectPoint,
	selectConnectPoint,
	startLassoSelection,
	updateLassoSelection,
	stopLassoSelection,
} = stageSlice.actions;

export default stageSlice.reducer;

