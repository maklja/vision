import { ColorTheme, retrieveThemeColors } from './colors';
import { connectLineTheme, ConnectLineTheme } from './connectLineTheme';
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

export interface Theme {
	colors: ColorTheme;
	drawer: ElementDrawerTheme;
	connectLine: ConnectLineTheme;
	connectPoints: ConnectPointsTheme;
	simulation: SimulationTheme;
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
		connectLine: connectLineTheme(defaultColorTheme),
		connectPoints: connectPointsTheme(defaultColorTheme),
		simulation: simulationTheme(defaultColorTheme),
	};
	return {
		[ElementType.IIf]: {
			connectPoints: iifConnectPointsTheme(defaultColorTheme),
		},
		default: defaultTheme,
	};
};

export interface DrawerThemeState {
	highlight?: boolean;
	select?: boolean;
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
