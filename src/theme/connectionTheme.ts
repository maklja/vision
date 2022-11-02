import Konva from 'konva';
import { AnimationControl } from './animation';

export interface ConnectPointStyle {
	stroke?: string;
	strokeWidth?: number;
	fill: string;
}

export const connectPointTheme: ConnectPointStyle = {
	stroke: 'blue',
	strokeWidth: 1,
	fill: '#eee',
};

export const highlightConnectPointTheme: ConnectPointStyle = {
	...connectPointTheme,
	fill: 'blue',
};

export const snapConnectPointAnimation = (node: Konva.Node): AnimationControl =>
	new AnimationControl(
		new Konva.Tween({
			node,
			duration: 0.1,
			fill: 'green',
			scaleX: 1.4,
			scaleY: 1.4,
		}),
	);

