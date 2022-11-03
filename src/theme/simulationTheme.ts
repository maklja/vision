import Konva from 'konva';
import { Animation, AnimationControl } from './animation';

export const resultSimulationTheme: Konva.CircleConfig = {
	stroke: 'green',
	fill: 'green',
	radius: 10,
};

export interface MoveAnimation {
	targetPosition: { x: number; y: number };
	sourcePosition: { x: number; y: number };
}

export const moveResultAnimation = (moveParams: MoveAnimation): Animation => {
	const { sourcePosition, targetPosition } = moveParams;
	const duration =
		Math.sqrt(
			Math.pow(targetPosition.x - sourcePosition.x, 2) +
				Math.pow(targetPosition.y - sourcePosition.y, 2),
		) / 150;

	return (node: Konva.Node): AnimationControl =>
		new AnimationControl(
			new Konva.Tween({
				node,
				duration,
				x: targetPosition.x,
				y: targetPosition.y,
			}),
		);
};
