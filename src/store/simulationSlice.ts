import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { RootState } from './rootState';

export interface SetObservableEventsAction {
	type: string;
	payload: ObservableEvent[];
}

export interface ObservableEvent {
	id: string;
	value: unknown;
	hash: string;
	connectLineId: string;
}

export interface Simulation {
	id: string;
	completed: boolean;
	events: ObservableEvent[];
}

const simulationAdapter = createEntityAdapter<Simulation>({
	selectId: (simulation) => simulation.id,
});

export const simulationsSlice = createSlice({
	name: 'simulations',
	initialState: simulationAdapter.getInitialState(),
	reducers: {
		createSimulation: simulationAdapter.addOne,
	},
});

export const { createSimulation } = simulationsSlice.actions;

export default simulationsSlice.reducer;

const simulationsSelector = simulationAdapter.getSelectors<RootState>((state) => state.simulations);

export const selectSimulationById = (id: string) => (state: RootState) =>
	simulationsSelector.selectById(state, id) ?? null;

