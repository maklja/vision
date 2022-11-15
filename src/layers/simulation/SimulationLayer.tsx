import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectDrawerSettingsById } from '../../store/drawersSlice';
import { Simulation } from '../../store/simulationSlice';
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

	const sourceDrawerAnimation = useSelector(
		selectDrawerSettingsById(connectLine?.sourceId ?? null),
	)?.animations?.highlight;
	const targetDrawerAnimation = useSelector(
		selectDrawerSettingsById(connectLine?.targetId ?? null),
	)?.animations?.highlight;

	if (!connectLine || !observableEvent) {
		return null;
	}

	const handleComplete = () => setSimulationStep(simulationStep + 1);

	const skipSourceDrawerAnimation = prevConnectLine?.targetId === connectLine?.sourceId;
	return (
		<SimulationStep
			connectLine={connectLine}
			observableEvent={observableEvent}
			sourceDrawerAnimation={skipSourceDrawerAnimation ? null : sourceDrawerAnimation}
			targetDrawerAnimation={targetDrawerAnimation}
			onComplete={handleComplete}
		/>
	);
};

