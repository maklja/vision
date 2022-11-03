import { createSlice, Draft } from '@reduxjs/toolkit';
import { ConnectLine, Element } from '../model';
import { RootState } from './rootState';

export interface SetObservableEventsAction {
	type: string;
	payload: ObservableEvent[];
}

export interface ObservableEvent {
	id: string;
	value: unknown;
	connectLine: ConnectLine;
	sourceElement: Element;
	targetElement: Element;
}

export interface SimulationSlice {
	currentEvent: ObservableEvent | null;
	events: ObservableEvent[];
}

const initialState: SimulationSlice = {
	events: [],
	currentEvent: null,
};

export const simulationSlice = createSlice({
	name: 'simulation',
	initialState: initialState,
	reducers: {
		setObservableEvents: (slice: Draft<SimulationSlice>, action: SetObservableEventsAction) => {
			slice.events = action.payload;
			slice.currentEvent = action.payload[0];
		},
		moveToNextObservableEvent: (slice: Draft<SimulationSlice>) => {
			const { currentEvent, events } = slice;
			const currentIdx = events.findIndex((event) => event.id === currentEvent?.id);
			if (currentIdx === -1 || currentIdx >= events.length - 1) {
				slice.currentEvent = null;
				return;
			}

			slice.currentEvent = events[currentIdx + 1];
		},
	},
});

export const { moveToNextObservableEvent, setObservableEvents } = simulationSlice.actions;

export default simulationSlice.reducer;

export const selectNextObservableEvent = (state: RootState) => state.simulation.currentEvent;
