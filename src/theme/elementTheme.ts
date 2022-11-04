import Konva from 'konva';
import { AnimationControl, TweenAnimationControl } from './animation';

export const elementTheme: Konva.ShapeConfig = {
	stroke: 'black',
	fill: '#eee',
	strokeWidth: 1.5,
};

export const elementTextTheme: Konva.TextConfig = {
	stroke: 'black',
	strokeWidth: 1,
	letterSpacing: 1.8,
	fontFamily: 'serif',
};

export const elementIconTheme: Konva.TextConfig = {
	stroke: 'black',
	strokeWidth: 1,
	letterSpacing: 1,
	fontFamily: 'serif',
};

export const highlightElementAnimation = (node: Konva.Node): AnimationControl =>
	new TweenAnimationControl(
		new Konva.Tween({
			node,
			duration: 2,
			fill: 'green',
			scaleX: 1.4,
			scaleY: 1.4,
		}),
	);

