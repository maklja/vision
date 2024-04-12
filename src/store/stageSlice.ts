import { createSlice, EntityState } from '@reduxjs/toolkit';
import {
	ConnectLineEntity,
	connectLinesAdapterReducers,
	createConnectLinesAdapterInitialState,
} from './connectLines';
import { createSimulationInitialState, Simulation, simulationReducers } from './simulation';

export * from './hooks/theme';

export interface StageSlice {
	connectLines: EntityState<ConnectLineEntity>;
	simulation: Simulation;
}

export const createStageInitialState = (): StageSlice => ({
	connectLines: createConnectLinesAdapterInitialState(),
	simulation: createSimulationInitialState(),
});

export const stageSlice = createSlice({
	name: 'stage',
	initialState: createStageInitialState(),
	reducers: {
		...connectLinesAdapterReducers,
		...simulationReducers,
	},
});

export const {
	startSimulation,
	resetSimulation,
	completeSimulation,
	addObservableEvent,
	removeSimulationAnimation,
} = stageSlice.actions;

export default stageSlice.reducer;

