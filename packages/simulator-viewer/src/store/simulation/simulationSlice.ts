import { v1 } from 'uuid';
import { StateCreator } from 'zustand';
import { ConnectLine, FlowValueType, Point } from '@maklja/vision-simulator-model';
import { DrawerAnimation } from '../drawerAnimations';
import { RootState } from '../rootStore';
import { AnimationKey, MoveAnimation } from '../../animation';

export interface MoveSimulationAnimation extends DrawerAnimation<MoveAnimation & ObservableEvent> {
	key: AnimationKey.MoveDrawer;
}

export interface HighlightSimulationAnimation extends DrawerAnimation<ObservableEvent> {
	key: AnimationKey.HighlightDrawer;
}

export interface ErrorSimulationAnimation extends DrawerAnimation<ObservableEvent> {
	key: AnimationKey.ErrorDrawer;
}

export interface ObservableEvent {
	id: string;
	branchId: string;
	type: FlowValueType;
	hash: string;
	index: number;
	connectLinesId: string[];
	sourceElementId: string;
	targetElementId: string;
	value: string;
	time: number;
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
	animationsQueue: DrawerAnimation[];
	animations: Record<string, DrawerAnimation[]>;
}

export interface SimulationSlice {
	simulation: Simulation;
	startSimulation: () => void;
	stopSimulation: () => void;
	completeSimulation: () => void;
	addObservableEvent: (event: ObservableEvent) => void;
	removeSimulationAnimationAtIndex: (animationIdx: number) => void;
}

function createAnimations(
	events: (ObservableEvent | null)[],
	connectLines: Record<string, ConnectLine>,
	simulatorId: string,
): DrawerAnimation[] {
	const [prevEvent, currentEvent] = events;
	if (!currentEvent) {
		return [];
	}

	const { sourceElementId, targetElementId, type, connectLinesId } = currentEvent;
	const points = connectLinesId.flatMap((clId) => connectLines[clId]?.points ?? []);

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

function createEventAnimations(
	event: ObservableEvent,
	connectLines: Record<string, ConnectLine>,
	simulatorId: string,
): DrawerAnimation[] {
	const { sourceElementId, targetElementId, type, connectLinesId } = event;
	const points = connectLinesId.flatMap((clId) => connectLines[clId]?.points ?? []);

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
					...event,
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
		data: event,
	};
	const sourceAnimation: HighlightSimulationAnimation | ErrorSimulationAnimation = {
		id: v1(),
		dispose: false,
		drawerId: sourceElementId,
		key: animationKey,
		data: event,
	};

	return [sourceAnimation, ...resultAnimations, targetAnimation];
}

// const eventAnimation = createEventAnimations(event, state.connectLines, simulation.id);
// if (!simulation.animations[event.id]) {
// 	simulation.animations[event.id] = eventAnimation;
// } else {
// 	simulation.animations[event.id].push(...eventAnimation);
// }

// console.log({ ...simulation.animations });

export const createSimulationSlice: StateCreator<RootState, [], [], SimulationSlice> = (set) => ({
	simulation: {
		id: v1(),
		state: SimulationState.Stopped,
		completed: false,
		animationsQueue: [],
		events: [],
		animations: {},
	},
	startSimulation: () =>
		set((state) => {
			const { simulation, elements, connectLines, disabledConnectLines, disabledElements } =
				state;
			simulation.completed = false;
			simulation.state = SimulationState.Running;
			simulation.animationsQueue = [];
			simulation.events = [];

			disabledConnectLines.push(...Object.keys(connectLines));
			disabledElements.push(...Object.keys(elements));

			return state;
		}, true),
	stopSimulation: () =>
		set((state) => {
			const { simulation } = state;
			simulation.completed = false;
			simulation.state = SimulationState.Stopped;
			simulation.animationsQueue = [];
			simulation.events = [];

			state.disabledElements = [];
			state.disabledConnectLines = [];

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

			state.disabledElements = [];
			state.disabledConnectLines = [];

			return state;
		}, true),
	addObservableEvent: (event: ObservableEvent) =>
		set((state) => {
			const { simulation, connectLines } = state;
			const updatedEvents = [...simulation.events, event];

			// create simulation animations for each drawer that is affected by events
			const beginIndex = updatedEvents.length - 1;
			const animations: DrawerAnimation[] = updatedEvents
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
				.flatMap((eventsPair) =>
					createAnimations(eventsPair, state.connectLines, simulation.id),
				);

			simulation.events = updatedEvents;
			simulation.animationsQueue = [...simulation.animationsQueue, ...animations];
			simulation.completed = event.type !== FlowValueType.Next;

			const eventAnimations = simulation.animations[event.id] ?? [];
			eventAnimations.push(...createEventAnimations(event, connectLines, simulation.id));
			simulation.animations[event.id] = eventAnimations;

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

export const selectSimulationNextAnimation = (state: RootState): DrawerAnimation | null =>
	state.simulation.animationsQueue.at(0) ?? null;

export const selectNextAnimations = (state: RootState): DrawerAnimation[] => {
	const valueIds = Object.keys(state.animations);

	return valueIds
		.map((valueId) => state.animations[valueId].shift())
		.filter((value) => value != null);
};

