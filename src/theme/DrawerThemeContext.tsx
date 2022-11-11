import { createContext, useContext } from 'react';
import { ColorTheme, retrieveThemeColors } from './colors';
import { connectLineTheme, ConnectLineTheme } from './connectLineTheme';
import { connectPointTheme, ConnectPointTheme } from './connectPointTheme';
import { elementDrawerTheme, ElementDrawerTheme } from './elementDrawerTheme';

export interface DrawerThemeState {
	highlight?: boolean;
	select?: boolean;
}

const defaultColorTheme = retrieveThemeColors();
export interface DrawerTheme {
	colors: ColorTheme;
	drawer: ElementDrawerTheme;
	connectLine: ConnectLineTheme;
	connectPoint: ConnectPointTheme;
}

export const defaultTheme: DrawerTheme = {
	colors: defaultColorTheme,
	drawer: elementDrawerTheme(defaultColorTheme),
	connectLine: connectLineTheme(defaultColorTheme),
	connectPoint: connectPointTheme(defaultColorTheme),
};

export const DrawerThemeContext = createContext(defaultTheme);

export const useDrawerTheme = () => useContext(DrawerThemeContext);

export const useConnectPointTheme = (state: DrawerThemeState) => {
	const { connectPoint } = useDrawerTheme();
	if (state.highlight) {
		return connectPoint.highlightElement;
	}

	return connectPoint.element;
};

export const useElementDrawerTheme = (state: DrawerThemeState) => {
	const { drawer } = useDrawerTheme();

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
