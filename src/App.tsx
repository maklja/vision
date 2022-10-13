import Konva from 'konva';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from './store/rootState';
import { Stage, Layer } from 'react-konva';
import { createDrawerElement, createConnectLineElement } from './factory';
import {
	StageSlice,
	selectDrawers,
	moveConnectLineDraw,
	endConnectLineDraw,
} from './store/stageSlice';

function App() {
	const { drawers, connectLines } = useSelector<RootState, StageSlice>((store) => store.stage);
	const appDispatch = useAppDispatch();

	const handleMouseDown = () => appDispatch(selectDrawers([]));

	const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
		appDispatch(
			moveConnectLineDraw({
				id: 'lol',
				point: {
					x: e.evt.clientX,
					y: e.evt.clientY,
				},
			}),
		);
	};

	const handleOnMouseUp = () => {
		appDispatch(
			endConnectLineDraw({
				id: 'lol',
			}),
		);
	};

	return (
		<Stage
			style={{ backgroundColor: '#eee' }}
			width={window.innerWidth}
			height={window.innerHeight}
			onMouseDown={handleMouseDown}
			onMouseUp={handleOnMouseUp}
			onMouseMove={handleMouseMove}
		>
			<Layer>
				{connectLines.map((connectLine) => createConnectLineElement(connectLine))}
				{drawers.map((drawer) => createDrawerElement(drawer))}
			</Layer>
		</Stage>
	);
}

export default App;

