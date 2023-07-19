import { useMemo } from 'react';
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
import { SizeConfig, sizesConfig } from './sizes';
import { ConnectPointPosition, ElementType } from '../model';
import { iifConnectPointsTheme } from './iifDrawerTheme';

export interface Theme {
	colors: ColorTheme;
	drawer: ElementDrawerTheme;
	connectLine: ConnectLineTheme;
	connectPoints: ConnectPointsTheme;
	simulation: SimulationTheme;
	sizes: SizeConfig;
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
		sizes: sizesConfig(),
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
	error?: boolean;
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

	// if (state.error) {
	// 	return {
	// 		element: drawer.errorElement,
	// 		text: drawer.errorText,
	// 	};
	// }

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

export const fromSize = (value: number, size = 1, factor = 1) => value * size * factor;

export const useSizes = (theme: Theme, size = 1, factor = 1): SizeConfig => {
	const { sizes } = theme;

	return useMemo(() => {
		const { connectPointSizes, drawerSizes, fontSizes, simulationSizes } = sizes;
		const connectPointRadius = fromSize(connectPointSizes.radius, size, factor);
		const drawerHeight = fromSize(drawerSizes.height, size, factor);
		const drawerWidth = fromSize(drawerSizes.width, size, factor);
		const drawerRadius = fromSize(drawerSizes.radius, size, factor);
		const fontSizePrimary = fromSize(fontSizes.primary, size, factor);
		const simulationRadius = fromSize(simulationSizes.radius, size, factor);
		return {
			connectPointSizes: {
				radius: connectPointRadius,
			},
			drawerSizes: {
				width: drawerWidth,
				height: drawerHeight,
				radius: drawerRadius,
			},
			simulationSizes: {
				radius: simulationRadius,
			},
			fontSizes: {
				primary: fontSizePrimary,
			},
		};
	}, [size, factor, sizes]);
};
