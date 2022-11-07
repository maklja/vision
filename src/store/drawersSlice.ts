import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { DrawerAnimations } from '../drawers';

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

export default drawerSlice.reducer;
