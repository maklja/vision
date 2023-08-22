import { ColorTheme } from './colors';

export interface LineElementStyle {
	readonly stroke: string;
}

export interface ArrowElementStyle {
	readonly fill: string;
}

export interface LineTheme {
	readonly line: LineElementStyle;
	readonly arrow: ArrowElementStyle;
	readonly selectedLine: LineElementStyle;
	readonly selectedArrow: ArrowElementStyle;
	readonly highlightLine: LineElementStyle;
	readonly highlightArrow: ArrowElementStyle;
}

export interface LineThemeOverride {
	line?: Partial<LineElementStyle>;
	arrow?: Partial<ArrowElementStyle>;
	selectedLine?: Partial<ArrowElementStyle>;
	selectedArrow?: Partial<ArrowElementStyle>;
	highlightLine?: Partial<ArrowElementStyle>;
	highlightArrow?: Partial<ArrowElementStyle>;
}

export const lineDrawerTheme = (themeColors: ColorTheme): LineTheme => {
	const defaultLine: LineElementStyle = {
		stroke: themeColors.secondaryColor,
	};

	const defaultArrow: ArrowElementStyle = {
		fill: themeColors.secondaryColor,
	};

	return {
		line: defaultLine,
		arrow: defaultArrow,
		selectedLine: {
			...defaultLine,
			stroke: themeColors.primaryColor,
		},
		selectedArrow: {
			...defaultArrow,
			fill: themeColors.primaryColor,
		},
		highlightLine: {
			...defaultLine,
			stroke: themeColors.primaryColor,
		},
		highlightArrow: {
			...defaultArrow,
			fill: themeColors.primaryColor,
		},
	};
};

