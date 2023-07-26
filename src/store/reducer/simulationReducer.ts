import { v1 } from 'uuid';
import { Draft } from '@reduxjs/toolkit';
import { DrawerAnimation } from '../drawerAnimationsSlice';
import { StageSlice } from '../stageSlice';
import { createAnimations } from './createAnimations';

export interface SimulationAnimation extends DrawerAnimation {
	drawerId: string;
}

export interface AddNextObservableEventAction {
	type: string;
	payload: {
		nextEvent: ObservableEvent;
	};
}

export interface RemoveSimulationAnimationAction {
	type: string;
	payload: {
		animationId: string;
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
	index: number;
	connectLinesId: string[];
	sourceElementId: string;
	targetElementId: string;
}

export interface Simulation {
	id: string;
	completed: boolean;
	events: ObservableEvent[];
	animationsQueue: SimulationAnimation[];
}

export const resetSimulationReducer = (slice: Draft<StageSlice>) => {
	const { simulation } = slice;
	simulation.completed = false;
	simulation.animationsQueue = [];
	simulation.events = [];
};

export const completeSimulationReducer = (slice: Draft<StageSlice>) => {
	slice.simulation.completed = true;
};

export const addNextObservableEventReducer = (
	slice: Draft<StageSlice>,
	action: AddNextObservableEventAction,
) => {
	const { simulation } = slice;
	const updatedEvents = [...simulation.events, action.payload.nextEvent];
	simulation.events = updatedEvents;

	// create simulation animations for each drawer that is affected by events
	const beginIndex = updatedEvents.length - 2;
	const animations: SimulationAnimation[] = updatedEvents
		.slice(beginIndex)
		.reduce((group: (ObservableEvent | null)[][], currentEvent, i) => {
			// group simulation events by [previousEvent, currentEvent]
			// so you could determine if it required to show previous drawer animation
			const prevEvent = updatedEvents[beginIndex + i - 1];
			if (!prevEvent) {
				return [...group, [null, currentEvent]];
			}

			return [...group, [prevEvent, currentEvent]];
		}, [])
		.flatMap((eventsPair) => createAnimations(eventsPair, slice.connectLines, simulation.id))
		.map((animation) => ({
			...animation,
			id: v1(),
			simulationId: simulation.id,
			dispose: false,
		}));

	simulation.animationsQueue = [...simulation.animationsQueue, ...animations];
};

export const removeSimulationAnimationReducer = (
	slice: Draft<StageSlice>,
	action: RemoveSimulationAnimationAction,
) => {
	const { simulation } = slice;
	simulation.animationsQueue = simulation.animationsQueue.filter(
		(a) => a.id !== action.payload.animationId,
	);
};

