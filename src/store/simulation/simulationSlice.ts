import { v1 } from 'uuid';
import { StateCreator } from 'zustand';
import { FlowValueType } from '../../engine';
import { DrawerAnimation } from '../drawerAnimations';
import { RootState } from '../rootStore';
import { ConnectLine, Point } from '../../model';
import { AnimationKey, MoveAnimation } from '../../animation';

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

export interface SimulationAnimation<D = unknown> extends DrawerAnimation<D> {
	readonly drawerId: string;
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

export interface SimulationSlice {
	simulation: Simulation;
	startSimulation: () => void;
	resetSimulation: () => void;
	completeSimulation: () => void;
	addObservableEvent: (event: ObservableEvent) => void;
	removeSimulationAnimationAtIndex: (animationIdx: number) => void;
}

function createAnimations(
	events: (ObservableEvent | null)[],
	connectLines: ConnectLine[],
	simulatorId: string,
): SimulationAnimation[] {
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
	const showSameElementAnimation =
		prevEvent?.targetElementId !== sourceElementId || prevEvent?.type !== type;
	return showSameElementAnimation
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
}

export const createSimulationSlice: StateCreator<RootState, [], [], SimulationSlice> = (set) => ({
	simulation: {
		id: v1(),
		state: SimulationState.Stopped,
		completed: false,
		animationsQueue: [],
		events: [],
	},
	startSimulation: () =>
		set((state) => {
			const { simulation } = state;
			simulation.completed = false;
			simulation.state = SimulationState.Running;
			simulation.animationsQueue = [];
			simulation.events = [];

			return state;
		}, true),
	resetSimulation: () =>
		set((state) => {
			const { simulation } = state;
			simulation.completed = false;
			simulation.state = SimulationState.Stopped;
			simulation.animationsQueue = [];
			simulation.events = [];

			return state;
		}, true),
	completeSimulation: () =>
		set((state) => {
			const { simulation } = state;
			simulation.completed = true;
			simulation.state =
				simulation.animationsQueue.length > 0
					? SimulationState.Running
					: SimulationState.Stopped;

			return state;
		}, true),
	addObservableEvent: (event: ObservableEvent) =>
		set((state) => {
			const { simulation } = state;
			const updatedEvents = [...simulation.events, event];

			const connectLines = Object.values(state.connectLines);
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
			simulation.completed = event.type !== FlowValueType.Next;

			return state;
		}, true),
	removeSimulationAnimationAtIndex: (animationIdx: number) =>
		set((state) => {
			const { simulation } = state;
			simulation.animationsQueue.splice(animationIdx, 1);
			const isSimulationDone = !simulation.animationsQueue.length && simulation.completed;
			simulation.state = isSimulationDone ? SimulationState.Stopped : SimulationState.Running;

			return state;
		}, true),
});

export const selectSimulation = (state: RootState) => state.simulation;

export const selectSimulationNextAnimation = (state: RootState): SimulationAnimation | null =>
	state.simulation.animationsQueue.at(0) ?? null;

