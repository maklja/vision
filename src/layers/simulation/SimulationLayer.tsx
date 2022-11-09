import Konva from 'konva';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { AnimationSequence } from '../../animation';
import { ConnectLine } from '../../model';
import { selectDrawerSettings } from '../../store/drawersSlice';
import { selectSimulationById } from '../../store/simulationSlice';
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
	const [resultDrawerRef, setResultDrawerRef] = useState<Konva.Node | null>(null);

	const createResultDrawerAnimation = (connectLine: ConnectLine, node: Konva.Node) => {
		const [, sourcePoint] = connectLine.points;
		const [targetPoint] = connectLine.points.slice(-2);
		return moveResultAnimation({
			targetPosition: targetPoint,
			sourcePosition: sourcePoint,
		})(node);
	};

	useEffect(() => {
		if (!resultDrawerRef || !simulation) {
			return;
		}

		if (simulationStep >= simulation.events.length) {
			// TODO simulation completed
			return;
		}

		const { connectLineId } = simulation.events[simulationStep];
		const connectLine = connectLines.find((cl) => cl.id === connectLineId);
		if (!connectLine) {
			setSimulationStep((step) => step + 1);
			return;
		}

		const sourceDrawerSettings = drawerSettings.find((d) => d.id === connectLine.sourceId);
		const targetDrawerSettings = drawerSettings.find((d) => d.id === connectLine.targetId);
		const resultDrawerAnimation = createResultDrawerAnimation(connectLine, resultDrawerRef);

		const animation = new AnimationSequence([
			sourceDrawerSettings!.animations!.highlight!,
			resultDrawerAnimation,
			targetDrawerSettings!.animations!.highlight!,
		]);

		animation.play().then(() => setSimulationStep((step) => step + 1));
	}, [simulationStep, resultDrawerRef]);

	if (!simulation || simulationStep >= simulation.events.length) {
		return null;
	}

	const currentEvent = simulation.events[simulationStep];
	const connectLine = connectLines.find((cl) => cl.id === currentEvent.connectLineId);
	const [, position] = connectLine?.points ?? [];

	const resultColor = hashToColor(currentEvent.hash);
	const invertResultColor = invertColor(resultColor, false);
	return (
		<ResultDrawer
			key={currentEvent.id}
			x={position.x ?? 0}
			y={position.y ?? 0}
			ref={(ref) => setResultDrawerRef(ref)}
			fill={resultColor}
			stroke={invertResultColor}
		/>
	);
};

