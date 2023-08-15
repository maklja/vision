import { ColorTheme } from './colors';

export interface TooltipElementStyle {
	stroke: string;
	fill: string;
	strokeWidth: number;
	cornerRadius: number;
}

export interface TooltipTextStyle {
	fontStyle: string;
	fontFamily: string;
	textFill: string;
	fill: string;
}

export interface TooltipTheme {
	element: TooltipElementStyle;
	text: TooltipTextStyle;
}

export const tooltipTheme = (themeColors: ColorTheme): TooltipTheme => ({
	element: {
		cornerRadius: 5,
		strokeWidth: 0,
		stroke: themeColors.backgroundSecondaryColor,
		fill: themeColors.backgroundSecondaryColor,
	},
	text: {
		fill: themeColors.tertiaryTextColor,
		fontFamily: 'Calibri',
		fontStyle: 'bold',
		textFill: themeColors.tertiaryTextColor,
	},
});

