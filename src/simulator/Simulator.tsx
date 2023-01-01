import { useEffect, useRef, useState } from 'react';
import { Unsubscribable } from 'rxjs';
import { v1 } from 'uuid';
import { createObservableSimulation, FlowErrorEvent, FlowValueEvent } from '../engine';
import { useAppDispatch, useAppSelector } from '../store/rootState';
import {
	addNextObservableEvent,
	completeSimulation,
	createSimulation,
	ObservableEvent,
	ObservableEventType,
	selectSimulationById,
} from '../store/simulationSlice';
import { selectStage } from '../store/stageSlice';
import { SimulatorStage } from './SimulatorStage';
import {
	addDrawerAnimation,
	addSimulationAnimations,
	selectSimulationNextAnimation,
} from '../store/drawerAnimationsSlice';
import { AnimationKey } from '../animation';

export const Simulator = () => {
	const [simulatorId] = useState(v1());
	const simulationStep = useRef(0);
	const [simulationSubscription, setSimulationSubscription] = useState<Unsubscribable | null>(
		null,
	);
	const { elements, connectLines } = useAppSelector(selectStage);
	const simulation = useAppSelector(selectSimulationById(simulatorId));
	const nextAnimation = useAppSelector(selectSimulationNextAnimation(simulatorId));
	const appDispatch = useAppDispatch();

	useEffect(() => {
		if (simulation?.id === simulatorId) {
			return;
		}

		appDispatch(
			createSimulation({
				id: simulatorId,
				events: [],
				completed: false,
			}),
		);
	}, [simulatorId]);

	useEffect(() => {
		if (!simulation) {
			return;
		}

		const { events } = simulation;
		if (events.length === 0 || events.length === simulationStep.current) {
			return;
		}

		const animations = events
			.slice(simulationStep.current)
			.reduce((group: (ObservableEvent | null)[][], currentEvent, i) => {
				const prevEvent = events[simulationStep.current + i - 1];
				if (!prevEvent) {
					return [...group, [null, currentEvent]];
				}

				return [...group, [prevEvent, currentEvent]];
			}, [])
			.map((eventsPair) => {
				const [prevEvent, currentEvent] = eventsPair;
				if (!currentEvent) {
					return [];
				}
				const { sourceElementId, targetElementId, type } = currentEvent;
				return prevEvent?.targetElementId !== sourceElementId
					? [
							{
								drawerId: sourceElementId,
								key: AnimationKey.HighlightDrawer,
							},
							{
								drawerId: targetElementId,
								key:
									type === ObservableEventType.Error
										? AnimationKey.ErrorDrawer
										: AnimationKey.HighlightDrawer,
							},
					  ]
					: [
							{
								drawerId: targetElementId,
								key:
									type === ObservableEventType.Error
										? AnimationKey.ErrorDrawer
										: AnimationKey.HighlightDrawer,
							},
					  ];
			})
			.flat();

		appDispatch(
			addSimulationAnimations({
				animations,
				simulationId: simulatorId,
			}),
		);
		simulationStep.current = events.length;
	}, [simulation?.events]);

	useEffect(() => {
		if (!nextAnimation) {
			return;
		}

		const { drawerId, key, id, simulationId } = nextAnimation;
		appDispatch(
			addDrawerAnimation({
				animationId: id,
				drawerId,
				key,
				simulationId,
			}),
		);
	}, [nextAnimation?.id]);

	const dispatchNextEvent = (event: FlowValueEvent<unknown>) =>
		appDispatch(
			addNextObservableEvent({
				id: simulatorId,
				nextEvent: {
					...event,
					type: ObservableEventType.Next,
				},
			}),
		);

	const dispatchErrorEvent = (event: FlowErrorEvent<unknown>) =>
		appDispatch(
			addNextObservableEvent({
				id: simulatorId,
				nextEvent: {
					...event,
					type: ObservableEventType.Error,
				},
			}),
		);

	const dispatchCompleteEvent = () =>
		appDispatch(
			completeSimulation({
				id: simulatorId,
			}),
		);

	const handleSimulationStart = () => {
		const subscription = createObservableSimulation(
			'intervalElement',
			elements,
			connectLines,
		).start({
			next: dispatchNextEvent,
			error: dispatchErrorEvent,
			complete: dispatchCompleteEvent,
		});
		setSimulationSubscription(subscription);
	};

	const handleSimulationStop = () => {
		simulationSubscription?.unsubscribe();
		setSimulationSubscription(null);
	};

	if (!simulation) {
		return null;
	}

	return (
		<div>
			<button onClick={handleSimulationStart}>Start simulation</button>
			<button onClick={handleSimulationStop}>Stop simulation</button>
			<SimulatorStage />
		</div>
	);
};
