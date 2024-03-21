import { ColorTheme } from './colors';
import { ConnectPointsThemeOverride } from './connectPointsTheme';

export function bufferToggleConnectPointsTheme(
	themeColors: ColorTheme,
): ConnectPointsThemeOverride {
	const openingElementStyle = {
		fill: themeColors.successPrimaryColor,
	};

	const openingConnectPointTheme = {
		element: openingElementStyle,
		highlightElement: {
			fill: themeColors.successSecondaryColor,
		},
	};

	const closingElementStyle = {
		fill: themeColors.errorPrimaryColor,
	};

	const closingConnectPointTheme = {
		element: closingElementStyle,
		highlightElement: {
			fill: themeColors.errorSecondaryColor,
		},
	};

	return {
		top: openingConnectPointTheme,
		bottom: closingConnectPointTheme,
	};
}

