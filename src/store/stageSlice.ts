import { createSlice, Draft } from '@reduxjs/toolkit';
import { ConnectionPoint, ConnectLine, Drawer, DrawerType } from '../model';

export interface StageSlice {
	drawers: Drawer[];
	connectLines: ConnectLine[];
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
};

const e2: Drawer = {
	id: 'test1',
	size: 1,
	x: 240,
	y: 240,
	type: DrawerType.Subscriber,
};

const c1: ConnectLine = {
	source: {
		id: 'test1',
		point: ConnectionPoint.Top,
		x: 240,
		y: 240,
	},
	target: {
		id: 'test',
		point: ConnectionPoint.Right,
		x: 239,
		y: 200,
	},
};

const initialState: StageSlice = {
	drawers: [e1, e2],
	connectLines: [c1],
	selected: [],
	highlighted: [],
};

export const stageSlice = createSlice({
	name: 'stage',
	initialState: initialState,
	reducers: {
		addDrawers: (state: Draft<StageSlice>, action: AddDrawersAction) => {
			state.drawers = action.payload;
		},
		selectDrawers: (state: Draft<StageSlice>, action: SelectDrawersAction) => {
			state.selected = action.payload;
		},
		highlightDrawers: (state: Draft<StageSlice>, action: HighlightDrawersAction) => {
			state.highlighted = action.payload;
		},
		removeHighlightDrawers: (state: Draft<StageSlice>, action: HighlightDrawersAction) => {
			state.highlighted = state.highlighted.filter(
				(drawerId) => !action.payload.includes(drawerId),
			);
		},
		moveDrawer: (state: Draft<StageSlice>, action: MoveDrawerAction) => {
			const { payload } = action;
			const drawerIdx = state.drawers.findIndex((drawer) => drawer.id === payload.id);
			if (drawerIdx === -1) {
				return;
			}

			const drawer = state.drawers[drawerIdx];
			const dx = payload.dx - drawer.x;
			const dy = payload.dy - drawer.y;
			state.drawers[drawerIdx] = {
				...drawer,
				x: payload.dx,
				y: payload.dy,
			};

			state.connectLines.forEach((cl) => {
				if (cl.source.id === drawer.id) {
					cl.source.x += dx;
					cl.source.y += dy;
				}

				if (cl.target.id === drawer.id) {
					cl.target.x += dx;
					cl.target.y += dy;
				}
			});
		},
	},
});

export const { addDrawers, selectDrawers, highlightDrawers, removeHighlightDrawers, moveDrawer } =
	stageSlice.actions;

export default stageSlice.reducer;

