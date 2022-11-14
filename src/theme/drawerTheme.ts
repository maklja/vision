import { ColorTheme, retrieveThemeColors } from './colors';
import { connectLineTheme, ConnectLineTheme } from './connectLineTheme';
import { connectPointTheme, ConnectPointTheme } from './connectPointTheme';
import { elementDrawerTheme, ElementDrawerTheme } from './elementDrawerTheme';
import { simulationTheme, SimulationTheme } from './simulationTheme';
import { SizeConfig, sizesConfig } from './sizes';

export interface DrawerTheme {
	colors: ColorTheme;
	drawer: ElementDrawerTheme;
	connectLine: ConnectLineTheme;
	connectPoint: ConnectPointTheme;
	simulation: SimulationTheme;
	sizes: SizeConfig;
}

const defaultColorTheme = retrieveThemeColors();
export const defaultTheme: DrawerTheme = {
	colors: defaultColorTheme,
	drawer: elementDrawerTheme(defaultColorTheme),
	connectLine: connectLineTheme(defaultColorTheme),
	connectPoint: connectPointTheme(defaultColorTheme),
	simulation: simulationTheme(defaultColorTheme),
	sizes: sizesConfig(),
};
