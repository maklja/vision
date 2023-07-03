import { ColorTheme } from './colors';

export interface ConnectPointElementStyle {
	stroke: string;
	strokeWidth: number;
	fill: string;
}

export interface ConnectPointIconStyle {
	stroke: string;
	strokeWidth: number;
	fill: string;
}

export interface ConnectPointTheme {
	element: ConnectPointElementStyle;
	icon: ConnectPointIconStyle;
	highlightElement: ConnectPointElementStyle;
	highlightIcon: ConnectPointIconStyle;
}

export const connectPointTheme = (themeColors: ColorTheme): ConnectPointTheme => {
	const elementDefault = {
		stroke: themeColors.secondaryColor,
		fill: themeColors.backgroundColor,
		strokeWidth: 2,
	};

	const iconDefault = {
		stroke: themeColors.textColor,
		fill: themeColors.textColor,
		strokeWidth: 0.6,
	};

	return {
		element: elementDefault,
		icon: iconDefault,
		highlightElement: {
			...elementDefault,
			stroke: themeColors.secondaryColor,
			fill: themeColors.tertiaryColor,
		},
		highlightIcon: {
			...iconDefault,
			stroke: themeColors.secondaryTextColor,
			fill: themeColors.secondaryTextColor,
		},
	};
};

