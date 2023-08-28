import { ColorTheme, retrieveThemeColors } from './colors';
import { lineDrawerTheme, LineTheme } from './lineDrawerTheme';
import {
	connectPointsTheme,
	ConnectPointsTheme,
	ConnectPointsThemeOverride,
} from './connectPointsTheme';
import {
	elementDrawerTheme,
	ElementDrawerTheme,
	ElementDrawerThemeOverride,
} from './elementDrawerTheme';
import { simulationTheme, SimulationTheme } from './simulationTheme';
import { ConnectPointPosition, ElementType } from '../model';
import { iifConnectPointsTheme } from './iifDrawerTheme';
import { TooltipTheme, tooltipTheme } from './tooltipTheme';

export interface Theme {
	readonly colors: ColorTheme;
	readonly drawer: ElementDrawerTheme;
	readonly connectLine: LineTheme;
	readonly connectPoints: ConnectPointsTheme;
	readonly simulation: SimulationTheme;
	readonly tooltip: TooltipTheme;
}

export interface DrawerThemeOverride {
	drawer?: ElementDrawerThemeOverride;
	connectPoints?: ConnectPointsThemeOverride;
}

export type ThemesContext = {
	[key in ElementType]?: DrawerThemeOverride;
} & { default: Theme };

export const createThemeContext = (): ThemesContext => {
	const defaultColorTheme = retrieveThemeColors();
	const defaultTheme = {
		colors: defaultColorTheme,
		drawer: elementDrawerTheme(defaultColorTheme),
		connectLine: lineDrawerTheme(defaultColorTheme),
		connectPoints: connectPointsTheme(defaultColorTheme),
		simulation: simulationTheme(defaultColorTheme),
		tooltip: tooltipTheme(defaultColorTheme),
	};
	return {
		[ElementType.IIf]: {
			connectPoints: iifConnectPointsTheme(defaultColorTheme),
		},
		default: defaultTheme,
	};
};

export interface DrawerCommonThemeState {
	highlight?: boolean;
	select?: boolean;
}

export interface DrawerThemeState extends DrawerCommonThemeState {
	hasError?: boolean;
}

export interface ConnectPointThemeState extends DrawerThemeState {
	position: ConnectPointPosition;
}

export const useConnectPointTheme = (state: ConnectPointThemeState, theme: Theme) => {
	const connectPointTheme = theme.connectPoints[state.position];
	if (state.highlight) {
		return {
			element: connectPointTheme.highlightElement,
			icon: connectPointTheme.highlightIcon,
		};
	}

	return {
		element: connectPointTheme.element,
		icon: connectPointTheme.icon,
	};
};

export const useElementDrawerTheme = (state: DrawerThemeState, theme: Theme) => {
	const { drawer } = theme;

	if (state.hasError && (state.select || state.highlight)) {
		return {
			element: {
				primary: {
					...drawer.errorElement.primary,
					fill: drawer.selectElement.primary.fill,
				},
				secondary: {
					...drawer.errorElement.secondary,
					fill: drawer.selectElement.secondary.fill,
				},
			},
			text: drawer.errorText,
		};
	}

	if (state.hasError) {
		return {
			element: drawer.errorElement,
			text: drawer.errorText,
		};
	}

	if (state.select) {
		return {
			element: drawer.selectElement,
			text: drawer.selectText,
		};
	}

	if (state.highlight) {
		return {
			element: drawer.highlightElement,
			text: drawer.highlightText,
		};
	}

	return {
		element: drawer.element,
		text: drawer.text,
	};
};

export const useTooltipTheme = (theme: Theme) => {
	const tooltipTheme = theme.tooltip;

	return {
		element: tooltipTheme.element,
		text: tooltipTheme.text,
	};
};

export const useLineDrawerTheme = (state: DrawerCommonThemeState, theme: Theme) => {
	if (state.highlight) {
		return {
			line: theme.connectLine.highlightLine,
			arrow: theme.connectLine.highlightArrow,
			dot: theme.connectLine.highlightDot,
		};
	}

	if (state.select) {
		return {
			line: theme.connectLine.selectedLine,
			arrow: theme.connectLine.selectedArrow,
			dot: theme.connectLine.selectedDot,
		};
	}

	return {
		line: theme.connectLine.line,
		arrow: theme.connectLine.arrow,
		dot: theme.connectLine.dot,
	};
};

