import Konva from 'konva';
import { Animation, TweenAnimation } from '../animation';
import { ColorTheme } from './colors';
import { DrawerTheme } from './DrawerThemeContext';

export interface ElementDrawerTheme {
	element: {
		stroke: string;
		fill: string;
		strokeWidth: number;
		cornerRadius: number;
	};
	text: {
		stroke: string;
		strokeWidth: number;
		letterSpacing: number;
		fontFamily: string;
	};
	highlightElement: {
		fill: string;
	};
	highlightText: {
		stroke: string;
	};
}

export const elementDrawerTheme = (themeColors: ColorTheme): ElementDrawerTheme => ({
	element: {
		stroke: themeColors.secondaryColor,
		fill: themeColors.primaryColor,
		strokeWidth: 2.5,
		cornerRadius: 10,
	},
	text: {
		stroke: themeColors.textColor,
		strokeWidth: 1,
		letterSpacing: 1.8,
		fontFamily: 'serif',
	},
	highlightElement: {
		fill: themeColors.secondaryColor,
	},
	highlightText: {
		stroke: themeColors.tertiaryColor,
	},
});

export const highlightElementAnimation = (node: Konva.Node, theme: DrawerTheme): Animation =>
	new TweenAnimation(
		{
			node,
			duration: 0.3,
			fill: theme.drawer.highlightElement.fill,
		},
		{ autoReverse: true },
	);

export const highlightTextAnimation = (node: Konva.Node, theme: DrawerTheme): Animation =>
	new TweenAnimation(
		{
			node,
			duration: 0.3,
			stroke: theme.drawer.highlightText.stroke,
		},
		{ autoReverse: true },
	);
