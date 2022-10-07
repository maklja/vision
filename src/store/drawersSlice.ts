import { createSlice, Draft } from '@reduxjs/toolkit';
import { Drawer } from '../model';

export interface DrawersSlice {
	active: Drawer[];
	selected: string[];
}

export interface AddDrawersAction {
	type: string;
	payload: Drawer[];
}

export interface SelectDrawersAction {
	type: string;
	payload: string[];
}

const initialState: DrawersSlice = {
	active: [],
	selected: [],
};

export const drawersSlice = createSlice({
	name: 'drawers',
	initialState: initialState,
	reducers: {
		addDrawers: (state: Draft<DrawersSlice>, action: AddDrawersAction) => {
			state.active = action.payload;
		},
		selectDrawers: (state: Draft<DrawersSlice>, action: SelectDrawersAction) => {
			state.selected = action.payload;
		},
	},
});

export const { addDrawers, selectDrawers } = drawersSlice.actions;

export default drawersSlice.reducer;

