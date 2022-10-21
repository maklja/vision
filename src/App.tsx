import Konva from 'konva';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from './store/rootState';
import { Stage, Layer } from 'react-konva';
import { createDrawerElement, createConnectLineElement } from './factory';
import {
	StageSlice,
	selectDrawers,
	moveConnectLineDraw,
	deleteConnectLineDraw,
} from './store/stageSlice';
import { engine } from './engine';

function App() {
	const { drawers, connectLines } = useSelector<RootState, StageSlice>((store) => store.stage);
	const appDispatch = useAppDispatch();

	const handleMouseDown = () => appDispatch(selectDrawers([]));

	const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
		const stage = e.target.getStage();
		const rect = stage?.getContent().getBoundingClientRect();
		appDispatch(
			moveConnectLineDraw({
				x: e.evt.clientX - (rect?.left ?? 0),
				y: e.evt.clientY - (rect?.top ?? 0),
			}),
		);
	};

	const handleOnMouseUp = () => {
		appDispatch(deleteConnectLineDraw());
	};

	const handleClick = () => {
		engine(drawers, connectLines);
	};

	return (
		<div>
			<button onClick={handleClick}>Click</button>
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
		</div>
	);
}

export default App;

