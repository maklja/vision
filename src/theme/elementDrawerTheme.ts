import Konva from 'konva';
import { Animation, TweenAnimation } from '../animation';
import { ColorTheme } from './colors';
import { DrawerTheme } from './DrawerThemeContext';

export interface ElementDrawerStyle {
	stroke: string;
	fill: string;
	strokeWidth: number;
	cornerRadius: number;
}

export interface ElementDrawerTextStyle {
	stroke: string;
	strokeWidth: number;
	letterSpacing: number;
	fontFamily: string;
}

export interface ElementDrawerTheme {
	element: ElementDrawerStyle;
	text: ElementDrawerTextStyle;
	highlightElement: ElementDrawerStyle;
	highlightText: ElementDrawerTextStyle;
	selectElement: ElementDrawerStyle;
	selectText: ElementDrawerTextStyle;
}

export const elementDrawerTheme = (themeColors: ColorTheme): ElementDrawerTheme => {
	const elementDefault = {
		stroke: themeColors.secondaryColor,
		fill: themeColors.primaryColor,
		strokeWidth: 2.5,
		cornerRadius: 10,
	};

	const textDefault = {
		stroke: themeColors.textColor,
		strokeWidth: 1,
		letterSpacing: 1.8,
		fontFamily: 'serif',
	};

	return {
		element: elementDefault,
		text: textDefault,
		highlightElement: {
			...elementDefault,
			fill: themeColors.secondaryColor,
		},
		highlightText: {
			...textDefault,
			stroke: themeColors.textColor,
		},
		selectElement: {
			...elementDefault,
			fill: themeColors.secondaryColor,
		},
		selectText: {
			...textDefault,
			stroke: themeColors.textColor,
		},
	};
};

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
