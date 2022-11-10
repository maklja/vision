import Konva from 'konva';
import { useEffect, useState } from 'react';
import { useAnimation, Animation, AnimationSequence } from '../../animation';
import { ConnectLine } from '../../model';
import { ObservableEvent } from '../../store/simulationSlice';
import { moveResultAnimation } from '../../theme';
import { ResultDrawer } from './ResultDrawer';
import { hashToColor, invertColor } from './utils';

export interface SimulationStepProps {
	connectLine: ConnectLine;
	observableEvent: ObservableEvent;
	sourceDrawerAnimation?: Animation | null;
	targetDrawerAnimation?: Animation | null;
	onComplete?: () => void;
}

export const SimulationStep = (props: SimulationStepProps) => {
	const {
		connectLine,
		observableEvent,
		sourceDrawerAnimation,
		targetDrawerAnimation,
		onComplete,
	} = props;
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

		const animation = new AnimationSequence(
			[sourceDrawerAnimation, resultAnimation, targetDrawerAnimation].filter(
				(a): a is Animation => Boolean(a),
			),
		);

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

