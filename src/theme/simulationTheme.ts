import Konva from 'konva';
import { Animation, AnimationControl } from './animation';

export const resultSimulationTheme: Konva.CircleConfig = {
	stroke: 'green',
	fill: 'green',
	radius: 10,
};

export const moveResultAnimation =
	(x: number, y: number): Animation =>
	(node: Konva.Node): AnimationControl =>
		new AnimationControl(
			new Konva.Tween({
				node,
				duration: 2,
				x,
				y,
			}),
		);

