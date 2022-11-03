import Konva from 'konva';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from './store/rootState';
import { Stage, Layer } from 'react-konva';
import { createDrawerElement, createConnectLineElement } from './factory';
import {
	StageSlice,
	selectElements,
	moveConnectLineDraw,
	deleteConnectLineDraw,
} from './store/stageSlice';
import { useState } from 'react';
import { Simulator, SimulationEvent } from './animator';
import { createObservableSimulation } from './engine';
import { ObservableEvent, setObservableEvents } from './store/simulationSlice';

function App() {
	const { elements, connectLines } = useSelector<RootState, StageSlice>((store) => store.stage);
	const [events, setEvents] = useState<SimulationEvent[]>([]);
	const appDispatch = useAppDispatch();

	const handleMouseDown = () => appDispatch(selectElements([]));

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
		const results: ObservableEvent[] = [];
		const observableSimulation = createObservableSimulation(
			'ofElement',
			elements,
			connectLines,
		);

		observableSimulation?.addFlowListener({
			onNextFlow: (event) => {
				const { id, connectLineId, sourceElementId, targetElementId, value } = event;
				const connectLine = connectLines.find((curCl) => curCl.id === connectLineId)!;
				const sourceElement = elements.find((curEl) => curEl.id === sourceElementId)!;
				const targetElement = elements.find((curEl) => curEl.id === targetElementId)!;

				results.push({
					id,
					value,
					connectLine,
					sourceElement,
					targetElement,
				});
			},
		});
		observableSimulation?.start({
			complete: () => {
				appDispatch(setObservableEvents(results));
			},
		});
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
					{elements.map((el) => createDrawerElement(el))}
					<Simulator />
				</Layer>
			</Stage>
		</div>
	);
}

export default App;
