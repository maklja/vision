import Konva from 'konva';
import { useEffect, useState } from 'react';
import { Circle } from 'react-konva';
import { AnimationControls, moveResultAnimation, resultSimulationTheme } from '../../theme';

export interface ResultDrawerAnimations {
	moveResult: AnimationControls;
}

export interface ResultDrawerProps {
	startPosition: { x: number; y: number };
	endPosition: { x: number; y: number };
}

export const ResultDrawer = (props: ResultDrawerProps) => {
	const [circleRef, setCircleRef] = useState<Konva.Circle | null>(null);
	const [animations, setAnimations] = useState<ResultDrawerAnimations | null>(null);

	useEffect(() => {
		if (!circleRef) {
			return;
		}

		setAnimations({
			moveResult: moveResultAnimation(circleRef, props.endPosition),
		});

		return () => {
			if (animations) {
				Object.values(animations).forEach((animation: AnimationControls) =>
					animation.destroy(),
				);
			}
		};
	}, [circleRef, props.startPosition, props.endPosition]);

	return (
		<Circle
			ref={(node) => setCircleRef(node)}
			{...resultSimulationTheme}
			x={props.startPosition.x}
			y={props.endPosition.y}
		/>
	);
};

