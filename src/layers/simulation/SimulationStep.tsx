import Konva from 'konva';
import { useEffect, useState } from 'react';
import { useAnimation, Animation, AnimationSequence } from '../../animation';
import { ConnectLine } from '../../model';
import { ObservableEvent, ObservableEventType } from '../../store/simulationSlice';
import { useThemeContext } from '../../store/stageSlice';
import { moveResultAnimation } from './animation/moveResultAnimation';
import { ResultDrawer } from './ResultDrawer';
import { hashToColor, invertColor } from './utils';

export interface SimulationStepProps {
	connectLine: ConnectLine;
	observableEvent: ObservableEvent;
	sourceDrawerAnimation?: Animation | null;
	targetDrawerAnimation?: Animation | null;
	onComplete?: () => void;
}

export const SimulationStep = ({
	connectLine,
	observableEvent,
	sourceDrawerAnimation,
	targetDrawerAnimation,
	onComplete,
}: SimulationStepProps) => {
	const theme = useThemeContext();
	const [resultDrawerRef, setResultDrawerRef] = useState<Konva.Node | null>(null);
	const resultAnimation = useAnimation(
		resultDrawerRef,
		(node) => {
			const [, sourcePoint] = connectLine.points;
			const [targetPoint] = connectLine.points.slice(-2);
			node.position(sourcePoint);
			return moveResultAnimation(
				{
					targetPosition: targetPoint,
					sourcePosition: sourcePoint,
				},
				node,
			);
		},
		[connectLine],
	);

	useEffect(() => {
		if (!resultAnimation) {
			return;
		}

		const animations =
			observableEvent.type === ObservableEventType.Error
				? [sourceDrawerAnimation, targetDrawerAnimation]
				: [sourceDrawerAnimation, resultAnimation, targetDrawerAnimation];
		const animation = new AnimationSequence(
			animations.filter((a): a is Animation => Boolean(a)),
		);

		// TODO handle error
		animation
			.play()
			.catch((e) => console.log(e.message))
			.finally(() => onComplete?.());
	}, [resultAnimation, observableEvent.id]);

	const [, position] = connectLine.points;
	const resultColor = hashToColor(observableEvent.hash);
	const invertResultColor = invertColor(resultColor, false);
	return (
		<ResultDrawer
			theme={theme}
			x={position.x}
			y={position.y}
			ref={(ref) => setResultDrawerRef(ref)}
			fill={resultColor}
			stroke={invertResultColor}
		/>
	);
};

