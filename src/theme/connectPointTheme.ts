import Konva from 'konva';
import { Animation, TweenAnimation } from '../animation';
import { ColorTheme } from './colors';

export interface ConnectPointElementStyle {
	stroke: string;
	strokeWidth: number;
	fill: string;
}

export interface ConnectPointTheme {
	element: ConnectPointElementStyle;
	highlightElement: ConnectPointElementStyle;
}

export const connectPointTheme = (themeColors: ColorTheme): ConnectPointTheme => {
	const elementDefault = {
		stroke: themeColors.secondaryColor,
		fill: themeColors.backgroundColor,
		strokeWidth: 2,
	};

	return {
		element: elementDefault,
		highlightElement: {
			...elementDefault,
			stroke: themeColors.secondaryColor,
			fill: themeColors.tertiaryColor,
		},
	};
};

export const snapConnectPointAnimation = (node: Konva.Node): Animation =>
	new TweenAnimation({
		node,
		duration: 0.1,
		fill: 'green',
		scaleX: 1.4,
		scaleY: 1.4,
	});
