import Konva from 'konva';
import { Animation, TweenAnimation } from '../animation';

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

export const snapConnectPointAnimation = (node: Konva.Node): Animation =>
	new TweenAnimation({
		node,
		duration: 0.1,
		fill: 'green',
		scaleX: 1.4,
		scaleY: 1.4,
	});
