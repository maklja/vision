import { ColorTheme } from './colors';

export interface LineElementStyle {
	readonly stroke: string;
}

export interface ArrowElementStyle {
	readonly fill: string;
}

export interface DotElementStyle {
	readonly stroke: string;
	readonly fill: string;
	readonly strokeWidth: number;
}

export interface LineTheme {
	readonly line: LineElementStyle;
	readonly arrow: ArrowElementStyle;
	readonly dot: DotElementStyle;
	readonly selectedLine: LineElementStyle;
	readonly selectedArrow: ArrowElementStyle;
	readonly selectedDot: DotElementStyle;
	readonly highlightLine: LineElementStyle;
	readonly highlightArrow: ArrowElementStyle;
	readonly highlightDot: DotElementStyle;
}

export interface LineThemeOverride {
	line?: Partial<LineElementStyle>;
	arrow?: Partial<ArrowElementStyle>;
	dot?: Partial<DotElementStyle>;
	selectedLine?: Partial<ArrowElementStyle>;
	selectedArrow?: Partial<ArrowElementStyle>;
	selectedDot?: Partial<DotElementStyle>;
	highlightLine?: Partial<ArrowElementStyle>;
	highlightArrow?: Partial<ArrowElementStyle>;
	highlightDot?: Partial<DotElementStyle>;
}

export const lineDrawerTheme = (themeColors: ColorTheme): LineTheme => {
	const defaultLine: LineElementStyle = {
		stroke: themeColors.secondaryColor,
	};

	const defaultArrow: ArrowElementStyle = {
		fill: themeColors.secondaryColor,
	};

	const defaultDot: DotElementStyle = {
		fill: themeColors.primaryColor,
		stroke: themeColors.primaryColor,
		strokeWidth: 1,
	};

	return {
		line: defaultLine,
		arrow: defaultArrow,
		dot: defaultDot,
		selectedLine: {
			...defaultLine,
			stroke: themeColors.primaryColor,
		},
		selectedDot: {
			...defaultDot,
			fill: themeColors.secondaryColor,
			stroke: themeColors.secondaryColor,
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
		highlightDot: {
			...defaultDot,
			fill: themeColors.secondaryColor,
			stroke: themeColors.secondaryColor,
		},
	};
};

