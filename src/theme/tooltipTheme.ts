import { ColorTheme } from './colors';

export interface TooltipElementStyle {
	readonly stroke: string;
	readonly fill: string;
	readonly strokeWidth: number;
	readonly cornerRadius: number;
}

export interface TooltipTextStyle {
	readonly fontStyle: string;
	readonly fontFamily: string;
	readonly textFill: string;
	readonly fill: string;
}

export interface TooltipTheme {
	readonly element: TooltipElementStyle;
	readonly text: TooltipTextStyle;
}

export const tooltipTheme = (themeColors: ColorTheme): TooltipTheme => ({
	element: {
		cornerRadius: 5,
		strokeWidth: 0,
		stroke: themeColors.backgroundSecondaryColor,
		fill: themeColors.backgroundSecondaryColor,
	},
	text: {
		fill: themeColors.textTertiaryColor,
		fontFamily: 'Calibri',
		fontStyle: 'bold',
		textFill: themeColors.textTertiaryColor,
	},
});

