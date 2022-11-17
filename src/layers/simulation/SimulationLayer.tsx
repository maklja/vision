import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectDrawerSettingsById } from '../../store/drawersSlice';
import { ObservableEventType, Simulation } from '../../store/simulationSlice';
import { selectConnectLineById } from '../../store/stageSlice';
import { SimulationStep } from './SimulationStep';

export interface SimulatorLayerProps {
	simulation: Simulation;
}

export const SimulationLayer = ({ simulation }: SimulatorLayerProps) => {
	const [simulationStep, setSimulationStep] = useState(0);

	useEffect(() => {
		setSimulationStep(0);
	}, [simulation.id]);

	const simulationEvents = simulation?.events ?? [];
	const prevObservableEvent = simulationEvents.at(simulationStep - 1);
	const observableEvent = simulationEvents.at(simulationStep);
	const prevConnectLine = useSelector(
		selectConnectLineById(prevObservableEvent?.connectLineId ?? null),
	);
	const connectLine = useSelector(selectConnectLineById(observableEvent?.connectLineId ?? null));

	const sourceDrawerAnimations = useSelector(
		selectDrawerSettingsById(connectLine?.sourceId ?? null),
	)?.animations;
	const targetDrawerAnimation = useSelector(
		selectDrawerSettingsById(connectLine?.targetId ?? null),
	)?.animations?.highlight;

	if (!connectLine || !observableEvent) {
		return null;
	}

	const handleComplete = () => setSimulationStep(simulationStep + 1);

	const getSourceDrawerAnimation = () => {
		if (observableEvent.type === ObservableEventType.Error) {
			return sourceDrawerAnimations?.error;
		}

		if (prevConnectLine?.targetId === connectLine?.sourceId) {
			return null;
		}

		return sourceDrawerAnimations?.highlight;
	};

	const skipTargetDrawerAnimation = observableEvent.type === ObservableEventType.Error;
	return (
		<SimulationStep
			connectLine={connectLine}
			observableEvent={observableEvent}
			sourceDrawerAnimation={getSourceDrawerAnimation()}
			targetDrawerAnimation={skipTargetDrawerAnimation ? null : targetDrawerAnimation}
			onComplete={handleComplete}
		/>
	);
};

