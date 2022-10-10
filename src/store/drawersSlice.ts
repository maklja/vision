import { createSlice, Draft } from '@reduxjs/toolkit';
import { Drawer, DrawerType } from '../model';

export interface DrawersSlice {
	active: Drawer[];
	selected: string[];
	highlighted: string[];
}

export interface AddDrawersAction {
	type: string;
	payload: Drawer[];
}

export interface SelectDrawersAction {
	type: string;
	payload: string[];
}

export interface HighlightDrawersAction {
	type: string;
	payload: string[];
}

const e1: Drawer = {
	id: 'test',
	size: 1,
	x: 200,
	y: 200,
	type: DrawerType.Of,
};

const e2: Drawer = {
	id: 'test1',
	size: 1,
	x: 240,
	y: 240,
	type: DrawerType.Subscriber,
};

const initialState: DrawersSlice = {
	active: [e1, e2],
	selected: [],
	highlighted: [],
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
		highlightDrawers: (state: Draft<DrawersSlice>, action: HighlightDrawersAction) => {
			state.highlighted = action.payload;
		},
		removeHighlightDrawers: (state: Draft<DrawersSlice>, action: HighlightDrawersAction) => {
			state.highlighted = state.highlighted.filter(
				(drawerId) => !action.payload.includes(drawerId),
			);
		},
	},
});

export const { addDrawers, selectDrawers, highlightDrawers, removeHighlightDrawers } =
	drawersSlice.actions;

export default drawersSlice.reducer;
