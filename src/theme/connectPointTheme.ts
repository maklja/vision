import { ColorTheme } from './colors';

export interface ConnectPointElementStyle {
	stroke: string;
	strokeWidth: number;
	fill: string;
	radius: number;
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
		radius: 10,
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

