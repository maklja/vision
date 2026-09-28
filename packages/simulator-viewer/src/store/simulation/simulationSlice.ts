import { v1 } from 'uuid';
import { StateCreator } from 'zustand';
import {
	ConnectLine,
	ElementType,
	FlowValueType,
	Point,
	ResultElement,
	isSubscriberType,
} from '@maklja/vision-simulator-model';
import { DrawerAnimation, scheduleSimulationAnimations } from '../drawerAnimations';
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

export const MAX_PENDING_ANIMATION_GROUPS = 16;
export const MAX_SIMULATION_RESULTS = 100;

export interface Simulation {
	id: string;
	state: SimulationState;
	completed: boolean;
	results: string[];
	animations: {
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

function createResultElement(state: RootState, { id, connectLinesId, hash }: ObservableEvent) {
	if (state.elements[id]) {
		return;
	}

	const resultConnectLine = state.connectLines[connectLinesId[0]];
	if (!resultConnectLine) {
		return;
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
}

function addObservableEvent(state: RootState, event: ObservableEvent) {
	const animations = createAnimations(event, state.connectLines);
	const eventSimulations = state.simulation.animations.queue[event.id] ?? [];
	eventSimulations.push(...animations);
	state.simulation.animations.queue[event.id] = eventSimulations;
	state.simulation.completed = event.type !== FlowValueType.Next;
}

function recordSimulationResult(state: RootState, event: ObservableEvent) {
	const targetElement = state.elements[event.targetElementId];
	if (event.type !== FlowValueType.Next || !targetElement || !isSubscriberType(targetElement.type)) {
		return;
	}

	state.simulation.results.push(event.value);
	if (state.simulation.results.length > MAX_SIMULATION_RESULTS) {
		state.simulation.results.splice(
			0,
			state.simulation.results.length - MAX_SIMULATION_RESULTS,
		);
	}
}

function isAnimationGroupActive(state: RootState, animationGroupId: string) {
	return Object.values(state.animations).some(
		(drawerAnimations) => drawerAnimations[0]?.groupId === animationGroupId,
	);
}

function removeAnimationGroup(state: RootState, animationGroupId: string) {
	delete state.simulation.animations.queue[animationGroupId];
	delete state.elements[animationGroupId];

	Object.entries(state.animations).forEach(([drawerId, drawerAnimations]) => {
		const retainedAnimations = drawerAnimations.filter(
			(animation) => animation.groupId !== animationGroupId,
		);
		if (retainedAnimations.length === 0) {
			delete state.animations[drawerId];
		} else if (retainedAnimations.length !== drawerAnimations.length) {
			state.animations[drawerId] = retainedAnimations;
		}
	});
}

function admitAnimationGroup(state: RootState, event: ObservableEvent) {
	const queuedAnimationGroups = Object.keys(state.simulation.animations.queue);
	if (
		state.simulation.animations.queue[event.id] ||
		queuedAnimationGroups.length < MAX_PENDING_ANIMATION_GROUPS
	) {
		return true;
	}

	const evictableGroupId = queuedAnimationGroups.find(
		(animationGroupId) => !isAnimationGroupActive(state, animationGroupId),
	);
	if (evictableGroupId) {
		removeAnimationGroup(state, evictableGroupId);
		return true;
	}

	if (event.type === FlowValueType.Next) {
		return false;
	}

	const [oldestAnimationGroupId] = queuedAnimationGroups;
	removeAnimationGroup(state, oldestAnimationGroupId);
	return true;
}

export const createSimulationSlice: StateCreator<RootState, [], [], SimulationSlice> = (set) => ({
	simulation: {
		id: v1(),
		state: SimulationState.Stopped,
		completed: false,
		results: [],
		animations: {
			queue: {},
		},
	},
	startSimulation: () =>
		set((state) => {
			const { simulation } = state;
			simulation.completed = false;
			simulation.state = SimulationState.Running;
			simulation.animations = {
				queue: {},
			};
			simulation.results = [];

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
			};
			state.animations = {};
			simulation.results = [];

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
	createResultElement: (event: ObservableEvent) =>
		set((state) => {
			createResultElement(state, event);
			return state;
		}),
	simulateObservableEvent: (event: ObservableEvent) =>
		set((state) => {
			if (state.simulation.state === SimulationState.Stopped) {
				return state;
			}

			recordSimulationResult(state, event);
			if (!admitAnimationGroup(state, event)) {
				state.simulation.completed = event.type !== FlowValueType.Next;
				return state;
			}

			createResultElement(state, event);
			addObservableEvent(state, event);
			scheduleSimulationAnimations(state);
			return state;
		}, true),
	addObservableEvent: (event: ObservableEvent) =>
		set((state) => {
			addObservableEvent(state, event);
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

			eventAnimations.splice(animationIdx, 1);
			const [nextAnimation] = eventAnimations;

			if (eventAnimations.length === 0) {
				delete simulation.animations.queue[animationGroupId];
				delete state.elements[animationGroupId];
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
