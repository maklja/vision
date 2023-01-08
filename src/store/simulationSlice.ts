import { createEntityAdapter, createSlice, EntityState } from '@reduxjs/toolkit';
import { RootState } from './rootState';

export interface AddNextObservableEventAction {
	type: string;
	payload: {
		id: string;
		nextEvent: ObservableEvent;
	};
}

export interface ResetSimulationAction {
	type: string;
	payload: {
		id: string;
	};
}

export interface CompleteSimulationAction {
	type: string;
	payload: {
		id: string;
	};
}

export enum ObservableEventType {
	Next = 'next',
	Error = 'error',
	Complete = 'complete',
}

export interface ObservableEvent {
	id: string;
	type: ObservableEventType;
	value?: unknown;
	error?: unknown;
	hash: string;
	connectLineId: string;
	sourceElementId: string;
	targetElementId: string;
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
		resetSimulation: (slice: EntityState<Simulation>, action: ResetSimulationAction) => {
			const { id } = action.payload;

			return simulationAdapter.updateOne(slice, {
				id,
				changes: {
					events: [],
					completed: false,
				},
			});
		},
		addNextObservableEvent: (
			slice: EntityState<Simulation>,
			action: AddNextObservableEventAction,
		) => {
			const { id, nextEvent } = action.payload;
			const simulation = slice.entities[id];
			if (!simulation) {
				return;
			}

			return simulationAdapter.updateOne(slice, {
				id,
				changes: {
					events: [...simulation.events, nextEvent],
				},
			});
		},
		completeSimulation: (slice: EntityState<Simulation>, action: CompleteSimulationAction) => {
			const { id } = action.payload;
			const simulation = slice.entities[id];
			if (!simulation) {
				return;
			}
			return simulationAdapter.updateOne(slice, {
				id,
				changes: {
					completed: true,
				},
			});
		},
	},
});

export const { createSimulation, resetSimulation, addNextObservableEvent, completeSimulation } =
	simulationsSlice.actions;

export default simulationsSlice.reducer;

const simulationsSelector = simulationAdapter.getSelectors<RootState>((state) => state.simulations);

export const selectSimulationById = (id: string) => (state: RootState) =>
	simulationsSelector.selectById(state, id) ?? null;
