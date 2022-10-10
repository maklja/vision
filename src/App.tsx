import { useReducer, Reducer } from 'react';
import { useSelector } from 'react-redux';
import Konva from 'konva';
import { RootState, useAppDispatch } from './store/rootState';
import { Stage, Layer } from 'react-konva';
import { Drawer, DrawerType } from './model';
import { createDrawerElement } from './factory';
import { DrawersSlice, selectDrawers } from './store/drawersSlice';

interface StageState {
	drawers: Drawer[];
	selectedDrawers: string[];
	highlightDrawers: string[];
}

enum StageActionType {
	AddDrawers = 'addDrawers',
	SelectDrawers = 'selectDrawers',
	DeselectDrawers = 'deselectDrawers',
	HighlightDrawers = 'highlightDrawers',
	DownLightDrawers = 'downLightDrawers',
}

function App() {
	const { active } = useSelector<RootState, DrawersSlice>((store) => store.drawers);
	const appDispatch = useAppDispatch();

	const handleMouseDown = () => appDispatch(selectDrawers([]));

	return (
		<Stage
			style={{ backgroundColor: '#eee' }}
			width={window.innerWidth}
			height={window.innerHeight}
			onMouseDown={handleMouseDown}
		>
			<Layer>{active.map((drawer) => createDrawerElement(drawer))}</Layer>
		</Stage>
	);
}

export default App;
