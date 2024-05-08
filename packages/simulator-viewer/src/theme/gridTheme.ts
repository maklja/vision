import { ColorTheme } from './colors';

export interface GridTheme {
	readonly stroke: string;
	readonly strokeWidth: number;
	readonly size: number;
}

export function gridTheme(themeColors: ColorTheme): GridTheme {
	return {
		stroke: themeColors.backgroundTertiaryColor,
		strokeWidth: 1,
		size: 25,
	};
}

