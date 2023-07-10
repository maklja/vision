import { ColorTheme } from './colors';

export interface LineElementStyle {
	stroke: string;
}

export interface ArrowElementStyle {
	fill: string;
}

export interface ConnectLineTheme {
	line: LineElementStyle;
	arrow: ArrowElementStyle;
}

export interface ConnectLineThemeOverride {
	line?: Partial<LineElementStyle>;
	arrow?: Partial<ArrowElementStyle>;
}

export const connectLineTheme = (themeColors: ColorTheme): ConnectLineTheme => ({
	line: {
		stroke: themeColors.secondaryColor,
	},
	arrow: {
		fill: themeColors.secondaryColor,
	},
});

