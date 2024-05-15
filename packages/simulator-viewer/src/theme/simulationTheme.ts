import { ColorTheme } from './colors';

export interface SimulationTheme {
	readonly stroke: string;
	readonly fill: string;
}

export function simulationTheme(themeColors: ColorTheme): SimulationTheme {
	return {
		fill: themeColors.secondaryColor,
		stroke: themeColors.primaryColor,
	};
}

