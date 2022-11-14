import { ColorTheme } from './colors';

export interface SimulationTheme {
	stroke: string;
	fill: string;
}

export const simulationTheme = (themeColors: ColorTheme): SimulationTheme => {
	return {
		fill: themeColors.secondaryColor,
		stroke: themeColors.primaryColor,
	};
};

