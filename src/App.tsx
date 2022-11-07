import Konva from 'konva';
import { useSelector } from 'react-redux';
import { useAppDispatch } from './store/rootState';
import { Layer, Stage } from 'react-konva';
import {
	selectElements,
	moveConnectLineDraw,
	deleteConnectLineDraw,
	selectStage,
} from './store/stageSlice';
import { createObservableSimulation } from './engine';
import { ObservableEvent, createSimulation } from './store/simulationSlice';
import { createConnectLineElement } from './factory';
import { ConnectLineDrawer } from './drawers';
import { DrawerLayer } from './layers/drawer';
import { useState } from 'react';
import { SimulationLayer } from './layers/simulation';

function App() {
	const { elements, connectLines, draftConnectLine } = useSelector(selectStage);
	const [activeSimulationId, setActiveSimulationId] = useState<string | null>(null);
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
				const { id, connectLineId, value, hash } = event;
				results.push({
					id,
					hash,
					value,
					connectLineId,
				});
			},
		});
		observableSimulation?.start({
			complete: () => {
				appDispatch(
					createSimulation({
						id: 'test',
						events: results,
						completed: true,
					}),
				);
				setActiveSimulationId('test');
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
					{draftConnectLine ? (
						<ConnectLineDrawer
							key={draftConnectLine.id}
							id={draftConnectLine.id}
							points={draftConnectLine.points}
						/>
					) : null}
					<DrawerLayer />
					{activeSimulationId ? (
						<SimulationLayer simulationId={activeSimulationId} />
					) : null}
				</Layer>
			</Stage>
		</div>
	);
}

export default App;

