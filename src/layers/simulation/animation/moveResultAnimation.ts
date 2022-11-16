import Konva from 'konva';
import { TweenAnimation, Animation } from '../../../animation';
import { Point } from '../../../model';

export interface MoveAnimation {
	targetPosition: Point;
	sourcePosition: Point;
}

export const moveResultAnimation = (moveParams: MoveAnimation, node: Konva.Node): Animation => {
	const { sourcePosition, targetPosition } = moveParams;
	const duration =
		Math.sqrt(
			Math.pow(targetPosition.x - sourcePosition.x, 2) +
				Math.pow(targetPosition.y - sourcePosition.y, 2),
		) / 250;
	return new TweenAnimation(
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

