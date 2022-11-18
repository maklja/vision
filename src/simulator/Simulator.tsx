import { useEffect, useState } from 'react';
import { Unsubscribable } from 'rxjs';
import { v1 } from 'uuid';
import { createObservableSimulation, FlowErrorEvent, FlowValueEvent } from '../engine';
import { AnimationExecutionType, createAnimationSimulation } from '../store/animationSlice';
import { useAppDispatch, useAppSelector } from '../store/rootState';
import {
	addNextObservableEvent,
	completeSimulation,
	createSimulation,
	ObservableEventType,
	selectSimulationById,
} from '../store/simulationSlice';
import { selectStage } from '../store/stageSlice';
import { SimulatorStage, StageState } from './SimulatorStage';

export const Simulator = () => {
	const [simulatorId] = useState(v1());
	const [simulationSubscription, setSimulationSubscription] = useState<Unsubscribable | null>(
		null,
	);
	const { elements, connectLines } = useAppSelector(selectStage);
	const simulation = useAppSelector(selectSimulationById(simulatorId));
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

		setTimeout(() => {
			appDispatch(
				createAnimationSimulation({
					id: v1(),
					executionType: AnimationExecutionType.Group,
					animations: [
						{
							animationId: v1(),
							animationName: '',
							id: 'filterElement',
						},
						{
							animationId: v1(),
							animationName: '',
							id: 'filterElement_1',
						},
					],
				}),
			);
		}, 5_000);
	}, [simulatorId]);

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
			next: (event) => dispatchNextEvent(event),
			error: (error) => dispatchErrorEvent(error),
			complete: () => dispatchCompleteEvent(),
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
			<SimulatorStage
				simulation={simulation}
				state={simulationSubscription == null ? StageState.Draft : StageState.Simulation}
			/>
		</div>
	);
};

