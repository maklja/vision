import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectDrawerSettingsById } from '../../store/drawersSlice';
import { selectSimulationById } from '../../store/simulationSlice';
import { selectConnectLineById } from '../../store/stageSlice';
import { SimulationStep } from './SimulationStep';

export interface SimulatorLayerProps {
	simulationId: string;
}

export const SimulationLayer = (props: SimulatorLayerProps) => {
	const simulation = useSelector(selectSimulationById(props.simulationId));
	const [simulationStep, setSimulationStep] = useState(0);

	useEffect(() => {
		setSimulationStep(0);
	}, [props.simulationId]);

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

	const handleComplete = () => {
		if (simulationStep >= simulationEvents.length - 1) {
			return;
		}

		setSimulationStep(simulationStep + 1);
	};

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

