import deepMerge from 'deepmerge';
import { useSelector } from 'react-redux';
import { RootState } from '../rootState';
import { ElementType } from '../../model';
import { Theme, DrawerThemeOverride } from '../../theme';

export const useThemeContext = (type?: ElementType): Theme =>
	useSelector((state: RootState) => {
		const { themes } = state.stage;
		const elTheme = type ? themes[type] ?? {} : {};

		return themes.default;
		// TODO optimize
		// return deepMerge<Theme, DrawerThemeOverride>(themes.default, elTheme, {
		// 	arrayMerge: (_destinationArray, sourceArray) => sourceArray,
		// });
	});
