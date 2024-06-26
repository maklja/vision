import { v1 } from 'uuid';
import { StateCreator } from 'zustand';
import {
	ConnectLine,
	ElementType,
	FlowValueType,
	Point,
	ResultElement,
} from '@maklja/vision-simulator-model';
import { DrawerAnimation } from '../drawerAnimations';
import { RootState } from '../rootStore';
import { AnimationKey, MoveAnimation } from '../../animation';
import { moveElementToPosition, updateElement } from '../elements';

export interface ObservableEvent {
	id: string;
	type: FlowValueType;
	hash: string;
	index: number;
	connectLinesId: string[];
	sourceElementId: string;
	targetElementId: string;
	value: string;
	subscribeId: string | null;
	dependencies: string[];
}

export interface MoveSimulationAnimation extends DrawerAnimation<MoveAnimation & ObservableEvent> {
	key: AnimationKey.MoveDrawer;
}

export interface HighlightSimulationAnimation extends DrawerAnimation<ObservableEvent> {
	key: AnimationKey.HighlightDrawer;
}

export interface ErrorSimulationAnimation extends DrawerAnimation<ObservableEvent> {
	key: AnimationKey.ErrorDrawer;
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
	animations: {
		subscribed: string[];
		completed: string[];
		queue: Record<string, DrawerAnimation[]>;
	};
}

export interface SimulationSlice {
	simulation: Simulation;
	startSimulation: () => void;
	resetSimulation: () => void;
	completeSimulation: () => void;
	addObservableEvent: (event: ObservableEvent) => void;
	simulateObservableEvent: (event: ObservableEvent) => void;
	createResultElement: (event: ObservableEvent) => void;
	removeSimulationAnimation: (animationGroupId: string, animationId: string) => void;
}

function createAnimations(
	event: ObservableEvent,
	connectLines: Record<string, ConnectLine>,
): DrawerAnimation[] {
	const { id, sourceElementId, targetElementId, type, connectLinesId } = event;
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
				drawerId: id,
				groupId: id,
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
		groupId: id,
		dispose: false,
		drawerId: targetElementId,
		key: animationKey,
		data: event,
	};

	return [
		{
			id: v1(),
			groupId: id,
			dispose: false,
			drawerId: sourceElementId,
			key: animationKey,
			data: event,
		},
		...resultAnimations,
		targetAnimation,
	];
}

export const createSimulationSlice: StateCreator<RootState, [], [], SimulationSlice> = (
	set,
	get,
) => ({
	simulation: {
		id: v1(),
		state: SimulationState.Stopped,
		completed: false,
		animationsQueue: [],
		events: [],
		animations: {
			queue: {},
			completed: [],
			subscribed: [],
		},
	},
	startSimulation: () =>
		set((state) => {
			const { simulation } = state;
			simulation.completed = false;
			simulation.state = SimulationState.Running;
			simulation.animations = {
				queue: {},
				completed: [],
				subscribed: [],
			};
			simulation.events = [];

			return state;
		}, true),
	resetSimulation: () =>
		set((state) => {
			const { simulation } = state;

			// remove all results drawers
			Object.keys(simulation.animations.queue).forEach((animationGroupId) => {
				delete state.elements[animationGroupId];
			});

			simulation.completed = false;
			simulation.state = SimulationState.Stopped;
			simulation.animations = {
				queue: {},
				completed: [],
				subscribed: [],
			};
			simulation.events = [];

			return state;
		}, true),
	completeSimulation: () =>
		set((state) => {
			const { simulation } = state;
			simulation.completed = true;

			const hasAnimations = Object.keys(simulation.animations.queue).length > 0;
			simulation.state = hasAnimations ? SimulationState.Running : SimulationState.Stopped;

			return state;
		}, true),
	createResultElement: ({ id, connectLinesId, hash }: ObservableEvent) =>
		set((state) => {
			if (state.elements[id]) {
				return state;
			}

			const resultConnectLine = state.connectLines[connectLinesId[0]];
			if (!resultConnectLine) {
				return state;
			}

			const [, secondPoint] = resultConnectLine.points;
			const resultEl: ResultElement = {
				id,
				name: id,
				type: ElementType.Result,
				visible: false,
				x: secondPoint.x,
				y: secondPoint.y,
				properties: {
					hash,
				},
			};
			state.elements[id] = resultEl;
			return state;
		}),
	simulateObservableEvent: (event: ObservableEvent) => {
		if (get().simulation.state === SimulationState.Stopped) {
			return;
		}

		get().createResultElement(event);
		get().addObservableEvent(event);
		get().scheduleSimulationAnimations();
	},
	addObservableEvent: (event: ObservableEvent) =>
		set((state) => {
			const { simulation, connectLines } = state;
			const animations = createAnimations(event, connectLines);
			const eventSimulations = simulation.animations.queue[event.id] ?? [];
			eventSimulations.push(...animations);
			simulation.animations.queue[event.id] = eventSimulations;
			simulation.events.push(event);
			simulation.completed = event.type !== FlowValueType.Next;

			return state;
		}, true),
	removeSimulationAnimation: (animationGroupId: string, animationId: string) =>
		set((state) => {
			const { simulation } = state;
			const eventAnimations = simulation.animations.queue[animationGroupId];
			if (!eventAnimations) {
				return state;
			}

			const animationIdx = eventAnimations.findIndex(
				(animation) => animation.id === animationId,
			);
			if (animationIdx === -1) {
				return state;
			}

			const [removedAnimation] = eventAnimations.splice(animationIdx, 1);
			const [nextAnimation] = eventAnimations;

			const eventData = removedAnimation.data as ObservableEvent;
			if (eventAnimations.length === 0 && eventData.type === FlowValueType.Subscribe) {
				simulation.animations.subscribed.push(eventData.id);
			}

			if (eventAnimations.length === 0) {
				delete simulation.animations.queue[animationGroupId];
				delete state.elements[animationGroupId];
				simulation.animations.completed.push(animationGroupId);
			} else if (nextAnimation?.key === AnimationKey.MoveDrawer) {
				const moveAnimationData = nextAnimation.data as MoveAnimation;
				moveElementToPosition(state, {
					id: nextAnimation.groupId,
					x: moveAnimationData.sourcePosition.x,
					y: moveAnimationData.sourcePosition.y,
				});
			} else {
				updateElement(state, {
					id: animationGroupId,
					visible: false,
				});
			}

			const animationCompleted = Object.keys(simulation.animations.queue).length === 0;
			const isSimulationDone = animationCompleted && simulation.completed;
			simulation.state = isSimulationDone ? SimulationState.Stopped : SimulationState.Running;

			return state;
		}, true),
});

export const selectSimulation = (state: RootState) => state.simulation;

