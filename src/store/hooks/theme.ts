import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { SizeConfig } from '../../theme/sizes';
import { RootState } from '../rootState';

export interface DrawerThemeState {
	highlight?: boolean;
	select?: boolean;
}

export const useDrawerTheme = () => useSelector((state: RootState) => state.stage.theme);

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

export const fromSize = (value: number, size = 1, factor = 1) => value * size * factor;

export const useSizes = (size = 1, factor = 1): SizeConfig => {
	const { sizes } = useDrawerTheme();

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
