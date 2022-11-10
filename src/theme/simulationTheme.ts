import Konva from 'konva';
import { Animation, TweenAnimation } from '../animation';
import { Point } from '../model';
// import { Animation, AnimationControl, TweenAnimationControl } from './animation';

export const resultSimulationTheme: Konva.CircleConfig = {
	stroke: 'green',
	fill: 'green',
	radius: 10,
};

export interface MoveAnimation {
	targetPosition: Point;
	sourcePosition: Point;
}

export const moveResultAnimation = (moveParams: MoveAnimation) => {
	const { sourcePosition, targetPosition } = moveParams;
	const duration =
		Math.sqrt(
			Math.pow(targetPosition.x - sourcePosition.x, 2) +
				Math.pow(targetPosition.y - sourcePosition.y, 2),
		) / 150;
	return (node: Konva.Node): Animation =>
		new TweenAnimation(
			{
				node,
				duration,
				x: targetPosition.x,
				y: targetPosition.y,
			},
			{
				onAnimationStart: () => node.show(),
				onAnimationFinish: () => node.hide(),
			},
		);
};
