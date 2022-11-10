import { createContext, useContext } from 'react';
import { ColorTheme, retrieveThemeColors } from './colors';
import { connectLineTheme, ConnectLineTheme } from './connectLineTheme';
import { connectPointTheme, ConnectPointTheme } from './connectPointTheme';
import { elementDrawerTheme, ElementDrawerTheme } from './drawerTheme';

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

