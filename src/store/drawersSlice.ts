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

export interface MoveDrawerAction {
	type: string;
	payload: {
		id: string;
		dx: number;
		dy: number;
	};
}

const e1: Drawer = {
	id: 'test',
	size: 1,
	x: 200,
	y: 200,
	type: DrawerType.Of,
	connectionLines: [
		{
			sourceId: 'test1',
			targetId: 'test',
			sourceX: 240,
			sourceY: 240,
			targetX: 200,
			targetY: 200,
		},
	],
};

const e2: Drawer = {
	id: 'test1',
	size: 1,
	x: 240,
	y: 240,
	type: DrawerType.Subscriber,
	connectionLines: [
		{
			sourceId: 'test1',
			targetId: 'test',
			sourceX: 240,
			sourceY: 240,
			targetX: 200,
			targetY: 200,
		},
	],
};

const initialState: DrawersSlice = {
	active: [e1, e2],
	selected: [],
	highlighted: [],
};

let xx = 0;
let yy = 0;
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
		moveDrawer: (state: Draft<DrawersSlice>, action: MoveDrawerAction) => {
			const { payload } = action;
			const drawerIdx = state.active.findIndex((drawer) => drawer.id === payload.id) ?? null;
			if (drawerIdx === -1) {
				return;
			}

			const drawer = state.active[drawerIdx];

			const updatedDrawer = {
				...drawer,
				x: drawer.x + (payload.dx - xx),
				y: drawer.y + (payload.dy - yy),
			};
			console.log(payload.dx - xx, payload.dy - yy);
			xx = payload.dx;
			yy = payload.dy;

			state.active = [
				...state.active.slice(0, drawerIdx),
				updatedDrawer,
				...state.active.slice(drawerIdx + 1),
			];
		},
	},
});

export const { addDrawers, selectDrawers, highlightDrawers, removeHighlightDrawers, moveDrawer } =
	drawersSlice.actions;

export default drawersSlice.reducer;

