import { ColorTheme } from './colors';

export interface LineElementStyle {
	readonly stroke: string;
}

export interface ArrowElementStyle {
	readonly fill: string;
}

export interface ConnectLineTheme {
	readonly line: LineElementStyle;
	readonly arrow: ArrowElementStyle;
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

