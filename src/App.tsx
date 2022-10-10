import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from './store/rootState';
import { Stage, Layer } from 'react-konva';
import { createDrawerElement, createConnectElement } from './factory';
import { DrawersSlice, selectDrawers } from './store/drawersSlice';

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

	const connectors = active.flatMap((drawer) => drawer.connectors ?? []);
	return (
		<Stage
			style={{ backgroundColor: '#eee' }}
			width={window.innerWidth}
			height={window.innerHeight}
			onMouseDown={handleMouseDown}
		>
			<Layer>
				{active.map((drawer) => createDrawerElement(drawer))}
				{connectors.map((connector) => createConnectElement(connector))}
			</Layer>
		</Stage>
	);
}

export default App;

