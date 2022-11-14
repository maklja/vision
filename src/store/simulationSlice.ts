import { createEntityAdapter, createSlice, EntityState } from '@reduxjs/toolkit';
import { RootState } from './rootState';

export interface AddNextObservableEventAction {
	type: string;
	payload: {
		id: string;
		nextEvent: ObservableEvent;
	};
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
		addNextObservableEvent: (
			slice: EntityState<Simulation>,
			action: AddNextObservableEventAction,
		) => {
			const { id, nextEvent } = action.payload;
			slice.entities[id]?.events.push(nextEvent);
		},
	},
});

export const { createSimulation, addNextObservableEvent } = simulationsSlice.actions;

export default simulationsSlice.reducer;

const simulationsSelector = simulationAdapter.getSelectors<RootState>((state) => state.simulations);

export const selectSimulationById = (id: string) => (state: RootState) =>
	simulationsSelector.selectById(state, id) ?? null;

