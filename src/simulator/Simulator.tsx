import Box from '@mui/material/Box';
import Konva from 'konva';
import { useMemo, useRef, useState } from 'react';
import { Unsubscribable } from 'rxjs';
import Paper from '@mui/material/Paper';
import SettingsIcon from '@mui/icons-material/Settings';
import { SimulatorStage } from './SimulatorStage';
import { CommonProps, ConnectPointType, Point, isEntryOperatorType } from '../model';
import { OperatorsPanel, SimulationControls, ZoomControls } from '../ui';
import {
	FlowValueEvent,
	InvalidElementPropertyValueError,
	MissingNextElementError,
	MissingReferenceObservableError,
	UnsupportedElementTypeError,
	createObservableSimulation,
} from '../engine';
import { selectStageElements } from '../store/elements';
import { selectRelatedElementElements, selectStageConnectLines } from '../store/connectLines';
import { SimulationState, selectSimulation } from '../store/simulation';
import { OperatorPropertiesPanel } from '../ui/properties';
import { StageState, ZoomType, selectStageState } from '../store/stage';
import { zoomStage } from './state';
import { WindowShell } from '../ui/window';
import { useStore } from '../store/rootState';
import { selectElementsInSelection } from '../store/select/selectSlice';

export const Simulator = () => {
	const stageState = useStore(selectStageState());
	const simulation = useStore(selectSimulation);
	const elements = useStore(selectStageElements());
	const moveElement = useStore((state) => state.moveElement);
	const updateElement = useStore((state) => state.updateElement);
	const updateElementProperty = useStore((state) => state.updateElementProperty);
	const clearAllSelectedElements = useStore((state) => state.clearAllSelectedElements);
	const removeElementConnectLines = useStore((state) => state.removeElementConnectLines);
	const updateConnectLine = useStore((state) => state.updateConnectLine);
	const updateCanvasState = useStore((state) => state.updateCanvasState);
	const createElementError = useStore((state) => state.createElementError);
	const clearErrors = useStore((state) => state.clearErrors);
	const startSimulation = useStore((state) => state.startSimulation);
	const resetSimulation = useStore((state) => state.resetSimulation);
	const completeSimulation = useStore((state) => state.completeSimulation);
	const addObservableEvent = useStore((state) => state.addObservableEvent);
	const connectLines = useStore(selectStageConnectLines());
	const selectedElements = useStore(selectElementsInSelection());
	const selectedElementConnectLines = useStore(
		selectRelatedElementElements(selectedElements[0]?.id),
	);
	const stageRef = useRef<Konva.Stage | null>(null);

	const elementNames = useMemo<string[]>(
		() =>
			elements
				.filter((el) => el.id !== selectedElements[0]?.id)
				.map((el) => el.name.toLowerCase()),
		[elements, selectedElements],
	);

	const [simulationSubscription, setSimulationSubscription] = useState<Unsubscribable | null>(
		null,
	);

	const dispatchObservableEvent = (event: FlowValueEvent<unknown>) =>
		addObservableEvent({
			id: event.id,
			hash: event.hash,
			index: event.index,
			connectLinesId: event.connectLinesId,
			sourceElementId: event.sourceElementId,
			targetElementId: event.targetElementId,
			type: event.value.type,
			value: `${event.value.raw}`,
		});

	const dispatchCompleteEvent = () => completeSimulation();

	const handleSimulationStart = (entryElementId: string) => {
		if (!entryElementId) {
			return;
		}

		try {
			clearErrors();
			startSimulation();
			clearAllSelectedElements();
			const subscription = createObservableSimulation(
				entryElementId,
				elements,
				connectLines,
			).start({
				next: dispatchObservableEvent,
				error: dispatchObservableEvent,
				complete: dispatchCompleteEvent,
			});
			setSimulationSubscription(subscription);
		} catch (e) {
			if (
				e instanceof MissingReferenceObservableError ||
				e instanceof MissingNextElementError ||
				e instanceof UnsupportedElementTypeError ||
				e instanceof InvalidElementPropertyValueError
			) {
				resetSimulation();
				createElementError({
					elementId: e.elementId,
					errorMessage: e.message,
					errorId: e.id,
				});

				return;
			}

			throw e;
		}
	};

	const handleSimulationStop = () => {
		simulationSubscription?.unsubscribe();
		setSimulationSubscription(null);
		resetSimulation();
	};

	const handleSimulationReset = (entryElementId: string) => {
		simulationSubscription?.unsubscribe();
		setSimulationSubscription(null);

		resetSimulation();
		handleSimulationStart(entryElementId);
	};

	const handleElementPositionChange = (id: string, position: Point) =>
		moveElement({
			id,
			x: position.x,
			y: position.y,
		});

	const handleElementNameChange = (id: string, name: string) =>
		updateElement({
			id,
			name,
		});

	const handleElementPropertyChange = (
		id: string,
		propertyName: string,
		propertyValue: unknown,
	) => {
		updateElementProperty({
			id,
			propertyName,
			propertyValue,
		});

		if (propertyName === CommonProps.EnableObservableEvent && !propertyValue) {
			removeElementConnectLines({
				elementId: id,
				connectPointType: ConnectPointType.Event,
			});
		}
	};

	const handleConnectLineChanged = (id: string, changes: { index?: number; name?: string }) => {
		updateConnectLine({
			id,
			...changes,
		});
	};

	function handleZoom(zoomType: ZoomType) {
		const stage = stageRef.current;
		if (!stage) {
			return;
		}

		zoomStage(stage, zoomType);

		updateCanvasState({
			x: stage.position().x,
			y: stage.position().y,
			width: stage.width(),
			height: stage.height(),
			scaleX: stage.scaleX(),
			scaleY: stage.scaleY(),
		});
	}

	if (!simulation) {
		return null;
	}

	const popperVisible =
		simulation.state !== SimulationState.Running && stageState === StageState.Select;
	return (
		<Box sx={{ position: 'absolute', width: '100%', height: '100%' }}>
			<SimulatorStage ref={stageRef} />

			<Box
				sx={{
					position: 'absolute',
					top: '5px',
					left: 'calc(50% - 160px)',
					width: '400px',
					height: '40px',
				}}
			>
				<SimulationControls
					simulatorId={simulation.id}
					simulationState={simulation.state}
					entryElements={elements.filter((el) => isEntryOperatorType(el.type))}
					onSimulationStart={handleSimulationStart}
					onSimulationStop={handleSimulationStop}
					onSimulationReset={handleSimulationReset}
				/>
			</Box>

			<Box
				sx={{
					position: 'absolute',
					top: '20%',
					left: '2px',
					width: '70px',
					height: '50%',
				}}
			>
				<OperatorsPanel
					popperVisible={popperVisible}
					disabled={simulation.state === SimulationState.Running}
				/>
			</Box>

			<Box
				sx={{
					position: 'absolute',
					bottom: '2%',
					left: '2px',
					width: '40px',
				}}
			>
				<ZoomControls
					onZoomIn={() => handleZoom(ZoomType.In)}
					onZoomOut={() => handleZoom(ZoomType.Out)}
				/>
			</Box>

			{selectedElements.length === 1 ? (
				<WindowShell
					icon={<SettingsIcon color="inherit" />}
					title={`Element details: ${selectedElements[0].name}`}
					tooltip={selectedElements[0].name}
					showControlButtons={true}
					sx={{
						position: 'absolute',
						top: '15%',
						right: '10px',
						height: '70%',
						maxHeight: '70%',
					}}
				>
					<Paper
						elevation={0}
						sx={{
							width: '100%',
							height: '100%',
							overflow: 'auto',
						}}
					>
						<OperatorPropertiesPanel
							element={selectedElements[0]}
							elementNames={elementNames}
							relatedElements={selectedElementConnectLines}
							onNameChange={handleElementNameChange}
							onPositionChange={handleElementPositionChange}
							onPropertyValueChange={handleElementPropertyChange}
							onConnectLineChange={handleConnectLineChanged}
						/>
					</Paper>
				</WindowShell>
			) : null}
		</Box>
	);
};
