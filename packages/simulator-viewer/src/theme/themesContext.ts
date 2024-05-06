import deepMerge from 'deepmerge';
import { ConnectPointPosition, ElementType } from '@maklja/vision-simulator-model';
import { ColorTheme, retrieveThemeColor } from './colors';
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
import { iifConnectPointsTheme } from './iifDrawerTheme';
import { TooltipTheme, tooltipTheme } from './tooltipTheme';
import { SnapLineTheme, snapLineDrawerTheme } from './snapLineDrawerTheme';
import { GridTheme, gridTheme } from './gridTheme';
import { LassoTheme, lassoTheme } from './lassoTheme';
import { bufferToggleConnectPointsTheme } from './bufferToggleTheme';

export interface Theme {
	readonly colors: ColorTheme;
	readonly drawer: ElementDrawerTheme;
	readonly connectLine: LineTheme;
	readonly connectPoints: ConnectPointsTheme;
	readonly simulation: SimulationTheme;
	readonly tooltip: TooltipTheme;
	readonly snapLine: SnapLineTheme;
	readonly grid: GridTheme;
	readonly lasso: LassoTheme;
}

export interface DrawerThemeOverride {
	drawer?: ElementDrawerThemeOverride;
	connectPoints?: ConnectPointsThemeOverride;
}

export type ThemesContext = {
	[key in ElementType]?: Theme;
} & { default: Theme };

export function createThemeContext(id?: string): ThemesContext {
	const colorTheme = retrieveThemeColor(id);
	const defaultTheme = {
		colors: colorTheme,
		drawer: elementDrawerTheme(colorTheme),
		connectLine: lineDrawerTheme(colorTheme),
		connectPoints: connectPointsTheme(colorTheme),
		simulation: simulationTheme(colorTheme),
		tooltip: tooltipTheme(colorTheme),
		snapLine: snapLineDrawerTheme(colorTheme),
		grid: gridTheme(colorTheme),
		lasso: lassoTheme(colorTheme),
	};
	return {
		[ElementType.IIf]: deepMerge<Theme, DrawerThemeOverride>(
			defaultTheme,
			{ connectPoints: iifConnectPointsTheme(colorTheme) },
			{
				arrayMerge: (_destinationArray, sourceArray) => sourceArray,
			},
		),
		[ElementType.BufferToggle]: deepMerge<Theme, DrawerThemeOverride>(
			defaultTheme,
			{ connectPoints: bufferToggleConnectPointsTheme(colorTheme) },
			{
				arrayMerge: (_destinationArray, sourceArray) => sourceArray,
			},
		),
		default: defaultTheme,
	};
}

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

export const useConnectPointTheme = (theme: Theme, state: ConnectPointThemeState) => {
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

export const useElementDrawerTheme = (theme: Theme, state: DrawerThemeState) => {
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

export const useLineDrawerTheme = (theme: Theme, state: DrawerCommonThemeState = {}) => {
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

export const useSnapLineDrawerTheme = (theme: Theme) => {
	return {
		line: theme.snapLine.line,
	};
};

export const useGridTheme = (theme: Theme) => {
	return theme.grid;
};
