import Konva from 'konva';
import { Animation, TweenAnimation } from '../animation';
import { Point } from '../model';
import { ColorTheme } from './colors';

export interface SimulationTheme {
	stroke: string;
	fill: string;
}

export const simulationTheme = (themeColors: ColorTheme): SimulationTheme => {
	return {
		fill: themeColors.secondaryColor,
		stroke: themeColors.primaryColor,
	};
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
		) / 250;
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
