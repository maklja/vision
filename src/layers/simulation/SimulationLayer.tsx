import Konva from 'konva';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { AnimationSequence, useAnimation } from '../../animation';
import { ConnectLine } from '../../model';
import { DrawerSettings, selectDrawerSettings } from '../../store/drawersSlice';
import { ObservableEvent, selectSimulationById } from '../../store/simulationSlice';
import { selectStage } from '../../store/stageSlice';
import { moveResultAnimation } from '../../theme';
import { ResultDrawer } from './ResultDrawer';
import { hashToColor, invertColor } from './utils';

export interface SimulatorLayerProps {
	simulationId: string;
}

export const SimulationLayer = (props: SimulatorLayerProps) => {
	const { connectLines } = useSelector(selectStage);
	const drawerSettings = useSelector(selectDrawerSettings);
	const simulation = useSelector(selectSimulationById(props.simulationId));
	const [simulationStep, setSimulationStep] = useState(0);

	if (!simulation) {
		return null;
	}

	const { connectLineId } = simulation.events[simulationStep];
	const connectLine = connectLines.find((cl) => cl.id === connectLineId);
	const sourceDrawerSettings = drawerSettings.find((d) => d.id === connectLine?.sourceId);
	const targetDrawerSettings = drawerSettings.find((d) => d.id === connectLine?.targetId);

	if (!sourceDrawerSettings || !targetDrawerSettings) {
		return null;
	}

	const handleComplete = () => {
		if (simulationStep >= simulation.events.length - 1) {
			return;
		}

		setSimulationStep(simulationStep + 1);
	};

	return (
		<SimulationStep
			connectLine={connectLine!}
			observableEvent={simulation.events[simulationStep]}
			sourceDrawerSettings={sourceDrawerSettings}
			targetDrawerSettings={targetDrawerSettings}
			onComplete={handleComplete}
		/>
	);
};

interface SimulationStepProps {
	connectLine: ConnectLine;
	observableEvent: ObservableEvent;
	sourceDrawerSettings: DrawerSettings;
	targetDrawerSettings: DrawerSettings;
	onComplete?: () => void;
}

const SimulationStep = (props: SimulationStepProps) => {
	const { connectLine, observableEvent, sourceDrawerSettings, targetDrawerSettings, onComplete } =
		props;
	const [resultDrawerRef, setResultDrawerRef] = useState<Konva.Node | null>(null);
	const resultAnimation = useAnimation(
		resultDrawerRef,
		(node) => {
			const [, sourcePoint] = connectLine.points;
			const [targetPoint] = connectLine.points.slice(-2);
			node.position(sourcePoint);
			return moveResultAnimation({
				targetPosition: targetPoint,
				sourcePosition: sourcePoint,
			})(node);
		},
		[connectLine],
	);

	useEffect(() => {
		if (!resultAnimation) {
			return;
		}

		const animation = new AnimationSequence([
			sourceDrawerSettings.animations!.highlight!,
			resultAnimation,
			targetDrawerSettings.animations!.highlight!,
		]);

		// TODO handle error
		animation.play().finally(() => onComplete?.());
	}, [resultAnimation, observableEvent.id]);

	const [, position] = connectLine.points;
	const resultColor = hashToColor(observableEvent.hash);
	const invertResultColor = invertColor(resultColor, false);
	return (
		<ResultDrawer
			x={position.x}
			y={position.y}
			ref={(ref) => setResultDrawerRef(ref)}
			fill={resultColor}
			stroke={invertResultColor}
		/>
	);
};
