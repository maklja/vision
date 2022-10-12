import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from './store/rootState';
import { Stage, Layer } from 'react-konva';
import { createDrawerElement, createConnectLineElement } from './factory';
import { StageSlice, selectDrawers } from './store/stageSlice';

enum StageActionType {
	AddDrawers = 'addDrawers',
	SelectDrawers = 'selectDrawers',
	DeselectDrawers = 'deselectDrawers',
	HighlightDrawers = 'highlightDrawers',
	DownLightDrawers = 'downLightDrawers',
}

function App() {
	const { drawers, connectLines } = useSelector<RootState, StageSlice>((store) => store.stage);
	const appDispatch = useAppDispatch();

	const handleMouseDown = () => appDispatch(selectDrawers([]));

	return (
		<Stage
			style={{ backgroundColor: '#eee' }}
			width={window.innerWidth}
			height={window.innerHeight}
			onMouseDown={handleMouseDown}
		>
			<Layer>
				{connectLines.map((connectLine) => createConnectLineElement(connectLine))}
				{drawers.map((drawer) => createDrawerElement(drawer))}
			</Layer>
		</Stage>
	);
}

export default App;

