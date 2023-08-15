import { Draft } from '@reduxjs/toolkit';
import { DrawerAnimation } from '../drawerAnimationsSlice';
import { StageSlice } from '../stageSlice';
import { createAnimations } from './createAnimations';
import { FlowValueType } from '../../engine';
import { errorsAdapter } from './errorsReducer';
import { AnimationKey, MoveAnimation } from '../../animation';

export interface SimulationAnimation<D = unknown> extends DrawerAnimation<D> {
	readonly drawerId: string;
}

export interface MoveSimulationAnimation
	extends SimulationAnimation<MoveAnimation & ObservableEvent> {
	key: AnimationKey.MoveDrawer;
}

export interface HighlightSimulationAnimation extends SimulationAnimation<ObservableEvent> {
	key: AnimationKey.HighlightDrawer;
}

export interface ErrorSimulationAnimation extends SimulationAnimation<ObservableEvent> {
	key: AnimationKey.ErrorDrawer;
}

export interface AddSimulationAnimationsAction {
	type: string;
	payload: {
		simulationId: string;
		animations: { drawerId: string; key: AnimationKey; animationId?: string; data?: unknown }[];
	};
}

export interface RemoveSimulationAnimationAction {
	type: string;
	payload: {
		animationId: string;
	};
}

export interface ObservableEvent {
	id: string;
	type: FlowValueType;
	hash: string;
	index: number;
	connectLinesId: string[];
	sourceElementId: string;
	targetElementId: string;
}

export interface AddObservableEventAction {
	type: string;
	payload: {
		event: ObservableEvent;
	};
}

export enum SimulationState {
	Stopped = 'stopped',
	Running = 'running',
}

export interface Simulation {
	id: string;
	state: SimulationState;
	completed: boolean;
	events: ObservableEvent[];
	animationsQueue: SimulationAnimation[];
}

export const startSimulationReducer = (slice: Draft<StageSlice>) => {
	const { simulation } = slice;
	simulation.completed = false;
	simulation.state = SimulationState.Running;
	simulation.animationsQueue = [];
	simulation.events = [];
};

export const resetSimulationReducer = (slice: Draft<StageSlice>) => {
	const { simulation } = slice;
	simulation.completed = false;
	simulation.state = SimulationState.Stopped;
	simulation.animationsQueue = [];
	simulation.events = [];
};

export const completeSimulationReducer = (slice: Draft<StageSlice>) => {
	const { simulation } = slice;
	simulation.completed = true;
	simulation.state =
		simulation.animationsQueue.length > 0 ? SimulationState.Running : SimulationState.Stopped;
};

export const addObservableEventReducer = (
	slice: Draft<StageSlice>,
	action: AddObservableEventAction,
) => {
	const { simulation } = slice;
	const updatedEvents = [...simulation.events, action.payload.event];

	// create simulation animations for each drawer that is affected by events
	const beginIndex = updatedEvents.length - 1;
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
		.flatMap((eventsPair) => createAnimations(eventsPair, slice.connectLines, simulation.id));

	simulation.events = updatedEvents;
	simulation.animationsQueue = [...simulation.animationsQueue, ...animations];
	simulation.completed = action.payload.event.type !== FlowValueType.Next;
};

export const removeSimulationAnimationReducer = (
	slice: Draft<StageSlice>,
	action: RemoveSimulationAnimationAction,
) => {
	const { simulation } = slice;
	const animationIndex = simulation.animationsQueue.findIndex(
		(a) => a.id === action.payload.animationId,
	);

	if (animationIndex === -1) {
		return;
	}

	const animation = simulation.animationsQueue[animationIndex];
	const event = animation.data as ObservableEvent;

	if (event?.type === FlowValueType.Error) {
		slice.errors = errorsAdapter.addOne(slice.errors, {
			elementId: event.sourceElementId,
			errorId: event.id,
			errorMessage: 'Unknown error...',
		});
	} else {
		slice.errors = errorsAdapter.removeAll(slice.errors);
	}

	const updatedAnimationQueue = [
		...simulation.animationsQueue.slice(0, animationIndex),
		...simulation.animationsQueue.slice(animationIndex + 1),
	];
	const isSimulationDone = !updatedAnimationQueue.length && simulation.completed;

	simulation.animationsQueue = updatedAnimationQueue;
	simulation.state = isSimulationDone ? SimulationState.Stopped : SimulationState.Running;
};

