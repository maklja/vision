import { v1 } from 'uuid';
import { AnimationKey, MoveAnimation } from '../../animation';
import { FlowValueType } from '../../engine';
import { DrawerAnimation } from '../drawerAnimationsSlice';
import { Draft } from '@reduxjs/toolkit';
import { StageSlice } from '../stageSlice';
import { selectAllConnectLines } from '../connectLines';
import { ConnectLine, Point } from '../../model';
import { RootState } from '../rootState';
import { clearErrorsStateChange, createElementErrorStateChange } from '../errors';

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

export enum SimulationState {
	Stopped = 'stopped',
	Running = 'running',
}

export interface AddObservableEventAction {
	type: string;
	payload: {
		event: ObservableEvent;
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
	value: string;
}

export interface Simulation {
	id: string;
	state: SimulationState;
	completed: boolean;
	events: ObservableEvent[];
	animationsQueue: SimulationAnimation[];
}

export const createSimulationInitialState = () => ({
	id: v1(),
	state: SimulationState.Stopped,
	completed: false,
	animationsQueue: [],
	events: [],
});

const createAnimations = (
	events: (ObservableEvent | null)[],
	connectLines: ConnectLine[],
	simulatorId: string,
): SimulationAnimation[] => {
	const [prevEvent, currentEvent] = events;
	if (!currentEvent) {
		return [];
	}

	const { sourceElementId, targetElementId, type, connectLinesId } = currentEvent;
	const points = connectLinesId.flatMap((clId) => {
		const connectLine = connectLines.find((cl) => cl.id === clId);
		return connectLine ? connectLine.points : [];
	});

	const resultAnimations: MoveSimulationAnimation[] = points
		.slice(1, points.length - 1)
		.reduce((groupedPoints: Point[][], sourcePosition, i, pointsSlice) => {
			const targetPosition = pointsSlice[i + 1];
			if (targetPosition == null) {
				return groupedPoints;
			}

			return [...groupedPoints, [sourcePosition, targetPosition]];
		}, [])
		.map((pointsGroup) => {
			const [sourcePosition, targetPosition] = pointsGroup;
			return {
				id: v1(),
				dispose: false,
				drawerId: simulatorId,
				key: AnimationKey.MoveDrawer,
				data: {
					...currentEvent,
					sourcePosition,
					targetPosition,
				},
			};
		});

	const animationKey =
		type === FlowValueType.Error ? AnimationKey.ErrorDrawer : AnimationKey.HighlightDrawer;
	const targetAnimation: HighlightSimulationAnimation | ErrorSimulationAnimation = {
		id: v1(),
		dispose: false,
		drawerId: targetElementId,
		key: animationKey,
		data: currentEvent,
	};

	// if not equals do not show previous drawer animation otherwise do show it
	const showSameElementANimation =
		prevEvent?.targetElementId !== sourceElementId || prevEvent?.type !== type;
	return showSameElementANimation
		? [
				{
					id: v1(),
					dispose: false,
					drawerId: sourceElementId,
					key: animationKey,
					data: currentEvent,
				},
				...resultAnimations,
				targetAnimation,
		  ]
		: [...resultAnimations, targetAnimation];
};

export const simulationReducers = {
	startSimulation: (slice: Draft<StageSlice>) => {
		const { simulation } = slice;
		simulation.completed = false;
		simulation.state = SimulationState.Running;
		simulation.animationsQueue = [];
		simulation.events = [];
	},
	resetSimulation: (slice: Draft<StageSlice>) => {
		const { simulation } = slice;
		simulation.completed = false;
		simulation.state = SimulationState.Stopped;
		simulation.animationsQueue = [];
		simulation.events = [];
	},
	completeSimulation: (slice: Draft<StageSlice>) => {
		const { simulation } = slice;
		simulation.completed = true;
		simulation.state =
			simulation.animationsQueue.length > 0
				? SimulationState.Running
				: SimulationState.Stopped;
	},
	addObservableEvent: (slice: Draft<StageSlice>, action: AddObservableEventAction) => {
		const { simulation } = slice;
		const updatedEvents = [...simulation.events, action.payload.event];

		const connectLines = selectAllConnectLines(slice.connectLines);
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
			.flatMap((eventsPair) => createAnimations(eventsPair, connectLines, simulation.id));

		simulation.events = updatedEvents;
		simulation.animationsQueue = [...simulation.animationsQueue, ...animations];
		simulation.completed = action.payload.event.type !== FlowValueType.Next;
	},
	removeSimulationAnimation: (
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
			createElementErrorStateChange(slice, {
				elementId: event.sourceElementId,
				errorId: event.id,
				errorMessage: event.value,
			});
		} else {
			clearErrorsStateChange(slice);
		}

		const updatedAnimationQueue = [
			...simulation.animationsQueue.slice(0, animationIndex),
			...simulation.animationsQueue.slice(animationIndex + 1),
		];
		const isSimulationDone = !updatedAnimationQueue.length && simulation.completed;

		simulation.animationsQueue = updatedAnimationQueue;
		simulation.state = isSimulationDone ? SimulationState.Stopped : SimulationState.Running;
	},
};

export const selectSimulation = (state: RootState) => state.stage.simulation;

export const selectSimulationNextAnimation = (state: RootState): SimulationAnimation | null =>
	state.stage.simulation.animationsQueue.at(0) ?? null;

