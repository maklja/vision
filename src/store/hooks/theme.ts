import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import deepMerge from 'deepmerge';
import { RootState } from '../rootState';
import { ElementType } from '../../model';
import { Theme, DrawerThemeOverride } from '../../theme';

const selectThemes = (state: RootState) => state.stage.themes;

const selectElementType = (_state: RootState, elType?: ElementType) => elType;

const makeSelectThemeContext = () =>
	createSelector([selectThemes, selectElementType], (themes, elType) => {
		const elTheme = elType ? themes[elType] ?? {} : {};

		return deepMerge<Theme, DrawerThemeOverride>(themes.default, elTheme, {
			arrayMerge: (_destinationArray, sourceArray) => sourceArray,
		});
	});

export const useThemeContext = (type?: ElementType): Theme => {
	const selectThemeContext = useMemo(makeSelectThemeContext, []);
	return useSelector((state: RootState) => selectThemeContext(state, type));
};

