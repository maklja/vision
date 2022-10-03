import { useReducer, Reducer } from 'react';
import Konva from 'konva';
import { StageStateContext, State, stateTheme } from './state';
import { Stage, Layer } from 'react-konva';
import { Drawer, DrawerType } from './model';
import { createDrawerElement } from './factory';

interface StageState {
	drawers: Drawer[];
	selectedDrawers: string[];
}

enum StageActionType {
	AddDrawers = 'addDrawers',
	SelectDrawers = 'selectDrawers',
}

interface StageAction {
	type: StageActionType;
	drawers?: Drawer[];
	selectedDrawers?: string[];
}

const stageReducer: Reducer<StageState, StageAction> = (state, action) => {
	if (action.type === StageActionType.AddDrawers) {
		return {
			...state,
			drawers: [...state.drawers, ...(action.drawers ?? [])],
		};
	}

	return state;
};

const e1: Drawer = {
	id: 'test',
	size: 1,
	x: 200,
	y: 200,
	type: DrawerType.Of,
	selected: false,
};

const e2: Drawer = {
	id: 'test1',
	size: 1,
	x: 240,
	y: 240,
	type: DrawerType.Subscriber,
	selected: false,
};

function App() {
	const [stageState, dispatchStageState] = useReducer(stageReducer, {
		drawers: [e1, e2],
		selectedDrawers: [],
	});
	const handleMouseOver = (e: Konva.KonvaEventObject<MouseEvent>) => {
		// console.log('over', e.target);
	};
	const handleMouseOut = (e: Konva.KonvaEventObject<MouseEvent>) => {
		// console.log('out', e.target, e.currentTarget);
	};

	const handleMouseClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
		if (!e.target) {
			return;
		}
		console.log(e.target.attrs['id']);
	};

	return (
		<StageStateContext.Provider value={{ state: State.Select, theme: stateTheme.select }}>
			<Stage
				width={window.innerWidth}
				height={window.innerHeight}
				onMouseOver={handleMouseOver}
				onMouseOut={handleMouseOut}
				onClick={handleMouseClick}
			>
				<Layer>{stageState.drawers.map((drawer) => createDrawerElement(drawer))}</Layer>
			</Stage>
		</StageStateContext.Provider>
	);
}

export default App;

