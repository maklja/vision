import { useMemo } from 'react';
import { ColorTheme, retrieveThemeColors } from './colors';
import { connectLineTheme, ConnectLineTheme } from './connectLineTheme';
import { connectPointTheme, ConnectPointTheme } from './connectPointTheme';
import { elementDrawerTheme, ElementDrawerTheme } from './elementDrawerTheme';
import { simulationTheme, SimulationTheme } from './simulationTheme';
import { SizeConfig, sizesConfig } from './sizes';

export interface ThemeContext {
	colors: ColorTheme;
	drawer: ElementDrawerTheme;
	connectLine: ConnectLineTheme;
	connectPoint: ConnectPointTheme;
	simulation: SimulationTheme;
	sizes: SizeConfig;
}

export const createThemeContext = (): ThemeContext => {
	const defaultColorTheme = retrieveThemeColors();
	return {
		colors: defaultColorTheme,
		drawer: elementDrawerTheme(defaultColorTheme),
		connectLine: connectLineTheme(defaultColorTheme),
		connectPoint: connectPointTheme(defaultColorTheme),
		simulation: simulationTheme(defaultColorTheme),
		sizes: sizesConfig(),
	};
};

export interface DrawerThemeState {
	highlight?: boolean;
	select?: boolean;
	error?: boolean;
}

export const useConnectPointTheme = (state: DrawerThemeState, theme: ThemeContext) => {
	const { connectPoint } = theme;
	if (state.highlight) {
		return {
			element: connectPoint.highlightElement,
			icon: connectPoint.highlightIcon,
		};
	}

	return {
		element: connectPoint.element,
		icon: connectPoint.icon,
	};
};

export const useElementDrawerTheme = (state: DrawerThemeState, theme: ThemeContext) => {
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

export const useSizes = (theme: ThemeContext, size = 1, factor = 1): SizeConfig => {
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

