import { createSlice, Draft } from '@reduxjs/toolkit';
import { ConnectLine, Drawer, DrawerType } from '../model';

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
		x: number;
		y: number;
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
	sourceId: 'test1',
	targetId: 'test',
	points: [
		{ x: 240, y: 240 },
		{ x: 240, y: 255 },
		{ x: 239, y: 200 },
		{ x: 200, y: 200 },
	],
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
			const dx = payload.x - drawer.x;
			const dy = payload.y - drawer.y;
			state.drawers[drawerIdx] = {
				...drawer,
				x: payload.x,
				y: payload.y,
			};

			state.connectLines.forEach((cl) => {
				if (cl.sourceId === drawer.id) {
					const [p0, p1] = cl.points;
					p0.x += dx;
					p0.y += dy;
					p1.x += dx;
					p1.y += dy;
				}

				if (cl.targetId === drawer.id) {
					const [p0, p1] = cl.points.slice(-2);
					p0.x += dx;
					p0.y += dy;
					p1.x += dx;
					p1.y += dy;
				}
			});
		},
	},
});

export const { addDrawers, selectDrawers, highlightDrawers, removeHighlightDrawers, moveDrawer } =
	stageSlice.actions;

export default stageSlice.reducer;

