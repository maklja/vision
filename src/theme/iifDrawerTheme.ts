import { ColorTheme } from './colors';
import { ConnectPointsThemeOverride } from './connectPointsTheme';

export function iifConnectPointsTheme(themeColors: ColorTheme): ConnectPointsThemeOverride {
	const trueElementStyle = {
		fill: themeColors.successPrimaryColor,
	};

	const trueConnectPointTheme = {
		element: trueElementStyle,
		highlightElement: {
			fill: themeColors.successSecondaryColor,
		},
	};

	const falseElementStyle = {
		fill: themeColors.errorPrimaryColor,
	};

	const falseConnectPointTheme = {
		element: falseElementStyle,
		highlightElement: {
			fill: themeColors.errorSecondaryColor,
		},
	};

	return {
		top: trueConnectPointTheme,
		bottom: falseConnectPointTheme,
	};
}

