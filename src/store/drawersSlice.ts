import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { DrawerAnimations } from '../drawers';
import { RootState } from './rootState';

interface DrawerSettings {
	id: string;
	animations: DrawerAnimations | null;
}

const drawerSettingsAdapter = createEntityAdapter<DrawerSettings>({
	selectId: (drawerSettings) => drawerSettings.id,
});

export const drawerSlice = createSlice({
	name: 'drawers',
	initialState: drawerSettingsAdapter.getInitialState(),
	reducers: {
		addDrawerSettings: drawerSettingsAdapter.addOne,
		removeDrawerSettings: drawerSettingsAdapter.removeOne,
	},
});

export const { addDrawerSettings, removeDrawerSettings } = drawerSlice.actions;

const drawersSelector = drawerSettingsAdapter.getSelectors<RootState>((state) => state.drawers);

export const selectDrawerSettingsById = (id: string) => (state: RootState) =>
	drawersSelector.selectById(state, id) ?? null;

export const selectDrawerSettings = (state: RootState) => drawersSelector.selectAll(state);

export default drawerSlice.reducer;

