import Konva from 'konva';
import { Animation, TweenAnimation } from '../animation';
import { ColorTheme } from './colors';

export interface ConnectPointTheme {
	element: {
		stroke: string;
		strokeWidth: number;
		fill: string;
	};
	highlightElement: {
		stroke: string;
		strokeWidth: number;
		fill: string;
	};
}

export const connectPointTheme = (themeColors: ColorTheme): ConnectPointTheme => ({
	element: {
		stroke: themeColors.secondaryColor,
		fill: themeColors.backgroundColor,
		strokeWidth: 1,
	},
	highlightElement: {
		stroke: themeColors.secondaryColor,
		fill: themeColors.tertiaryColor,
		strokeWidth: 1,
	},
});

export const snapConnectPointAnimation = (node: Konva.Node): Animation =>
	new TweenAnimation({
		node,
		duration: 0.1,
		fill: 'green',
		scaleX: 1.4,
		scaleY: 1.4,
	});

