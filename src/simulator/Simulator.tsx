import { useEffect, useState } from 'react';
import { Unsubscribable } from 'rxjs';
import { v1 } from 'uuid';
import { createObservableSimulation, FlowEvent } from '../engine';
import { useAppDispatch, useAppSelector } from '../store/rootState';
import {
	addNextObservableEvent,
	completeSimulation,
	createSimulation,
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
	}, [simulatorId]);

	const dispatchNextEvent = (event: FlowEvent<unknown>) =>
		appDispatch(
			addNextObservableEvent({
				id: simulatorId,
				nextEvent: event,
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
			error: (error) => console.log(error),
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

