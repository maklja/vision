import { ConnectPointPosition } from '../model';
import { ColorTheme } from './colors';

export interface ConnectPointElementStyle {
	stroke: string;
	strokeWidth: number;
	fill: string;
}

export interface ConnectPointIconStyle {
	stroke: string;
	strokeWidth: number;
	fill: string;
}

export interface ConnectPointTheme {
	element: ConnectPointElementStyle;
	icon: ConnectPointIconStyle;
	highlightElement: ConnectPointElementStyle;
	highlightIcon: ConnectPointIconStyle;
}

export interface ConnectPointThemeOverride {
	element?: Partial<ConnectPointElementStyle>;
	icon?: Partial<ConnectPointIconStyle>;
	highlightElement?: Partial<ConnectPointElementStyle>;
	highlightIcon?: Partial<ConnectPointIconStyle>;
}

export type ConnectPointsTheme = {
	[key in ConnectPointPosition]: ConnectPointTheme;
};

export type ConnectPointsThemeOverride = {
	[key in ConnectPointPosition]?: ConnectPointThemeOverride;
};

export const connectPointsTheme = (themeColors: ColorTheme): ConnectPointsTheme => {
	const elementDefault = {
		stroke: themeColors.secondaryColor,
		fill: themeColors.backgroundPrimaryColor,
		strokeWidth: 2,
	};

	const iconDefault = {
		stroke: themeColors.textPrimaryColor,
		fill: themeColors.textPrimaryColor,
		strokeWidth: 0.6,
	};

	const connectPointThemeDefault = {
		element: elementDefault,
		icon: iconDefault,
		highlightElement: {
			...elementDefault,
			stroke: themeColors.secondaryColor,
			fill: themeColors.tertiaryColor,
		},
		highlightIcon: {
			...iconDefault,
			stroke: themeColors.textSecondaryColor,
			fill: themeColors.textSecondaryColor,
		},
	};

	return {
		top: connectPointThemeDefault,
		bottom: connectPointThemeDefault,
		left: connectPointThemeDefault,
		right: connectPointThemeDefault,
	};
};

