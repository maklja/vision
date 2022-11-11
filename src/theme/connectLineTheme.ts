import { ColorTheme } from './colors';

export interface ConnectLineTheme {
	line: {
		stroke: string;
	};
	arrow: {
		fill: string;
	};
}

export const connectLineTheme = (themeColors: ColorTheme): ConnectLineTheme => ({
	line: {
		stroke: themeColors.secondaryColor,
	},
	arrow: {
		fill: themeColors.secondaryColor,
	},
});
