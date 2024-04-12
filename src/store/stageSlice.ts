import { createSlice, EntityState } from '@reduxjs/toolkit';
import {
	ConnectLineEntity,
	connectLinesAdapterReducers,
	createConnectLinesAdapterInitialState,
} from './connectLines';
import { createSimulationInitialState, Simulation, simulationReducers } from './simulation';
import {
	createDrawerAnimationsInitialState,
	DrawerAnimations,
	drawerAnimationsAdapterReducers,
} from './drawerAnimations';

export * from './hooks/theme';

export interface StageSlice {
	connectLines: EntityState<ConnectLineEntity>;
	simulation: Simulation;
	animations: EntityState<DrawerAnimations>;
}

export const createStageInitialState = (): StageSlice => ({
	connectLines: createConnectLinesAdapterInitialState(),
	simulation: createSimulationInitialState(),
	animations: createDrawerAnimationsInitialState(),
});

export const stageSlice = createSlice({
	name: 'stage',
	initialState: createStageInitialState(),
	reducers: {
		...connectLinesAdapterReducers,
		...simulationReducers,
		...drawerAnimationsAdapterReducers,
	},
});

export const {
	startSimulation,
	resetSimulation,
	completeSimulation,
	addObservableEvent,
	removeSimulationAnimation,
	addDrawerAnimation,
	disposeDrawerAnimation,
	refreshDrawerAnimation,
	removeAllDrawerAnimation,
	removeDrawerAnimation,
} = stageSlice.actions;

export default stageSlice.reducer;

