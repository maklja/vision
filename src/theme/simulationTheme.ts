import Konva from 'konva';
import { AnimationControls } from './animation';

export const resultSimulationTheme: Konva.CircleConfig = {
	stroke: 'green',
	fill: 'green',
	radius: 10,
};

export const moveResultAnimation = (
	node: Konva.Node,
	position: { x: number; y: number },
): AnimationControls =>
	new Konva.Tween({
		node,
		duration: 0.5,
		x: position.x,
		y: position.y,
	});

