import Konva from 'konva';
import { useSelector } from 'react-redux';
import { useAppDispatch } from './store/rootState';
import { Layer, Stage } from 'react-konva';
import { v1 } from 'uuid';
import {
	selectElements,
	moveConnectLineDraw,
	deleteConnectLineDraw,
	selectStage,
} from './store/stageSlice';
import { createObservableSimulation } from './engine';
import { ObservableEvent, createSimulation } from './store/simulationSlice';
import { DrawerLayer } from './layers/drawer';
import { useState } from 'react';
import { SimulationLayer } from './layers/simulation';
import { ConnectLineLayer } from './layers/connectLine';

function App() {
	const { elements, connectLines } = useSelector(selectStage);
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
				const simulationId = v1();
				appDispatch(
					createSimulation({
						id: simulationId,
						events: results,
						completed: true,
					}),
				);
				setActiveSimulationId(simulationId);
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
					<ConnectLineLayer />
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

