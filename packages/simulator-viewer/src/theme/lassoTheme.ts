import { ColorTheme } from './colors';

export interface LassoTheme {
	readonly stroke: string;
	readonly fill: string;
	readonly strokeWidth: number;
	readonly cornerRadius: number;
}

export function lassoTheme(themeColors: ColorTheme): LassoTheme {
	return {
		stroke: themeColors.lassoPrimaryColor,
		fill: themeColors.lassoSecondaryColor,
		strokeWidth: 1,
		cornerRadius: 2,
	};
}

