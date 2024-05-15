import Konva from 'konva';
import { useState } from 'react';
import { Unsubscribable } from 'rxjs';
import Box from '@mui/material/Box';
import { useShallow } from 'zustand/react/shallow';
import type { FlowValueEvent } from '@maklja/vision-simulator-engine';
import { Element, isEntryOperatorType } from '@maklja/vision-simulator-model';
import { SimulationControls } from '../ui';
import { useRootStore } from '../store/rootStore';
import { selectSimulation } from '../store/simulation';
import { selectStageElements } from '../store/elements';
import { selectStageConnectLines } from '../store/connectLines';
import { calculateShapeSizeBoundingBox, findElementSize } from '../theme';

export interface SimulatorControlsProps {
	stage: Konva.Stage | null;
}

export function SimulatorControls({ stage }: SimulatorControlsProps) {
	const simulation = useRootStore(selectSimulation);
	const elements = useRootStore(selectStageElements());
	const entryElements = useRootStore(
		useShallow((state) =>
			Object.values(state.elements)
				.filter((el) => isEntryOperatorType(el.type))
				.sort((el1, el2) => el1.name.localeCompare(el2.name)),
		),
	);
	const elementSizes = useRootStore((state) => state.elementSizes);
	const connectLines = useRootStore(selectStageConnectLines());
	const clearAllSelectedElements = useRootStore((state) => state.clearAllSelectedElements);
	const createElementError = useRootStore((state) => state.createElementError);
	const clearErrors = useRootStore((state) => state.clearErrors);
	const startSimulation = useRootStore((state) => state.startSimulation);
	const resetSimulation = useRootStore((state) => state.resetSimulation);
	const completeSimulation = useRootStore((state) => state.completeSimulation);
	const addObservableEvent = useRootStore((state) => state.addObservableEvent);
	const updateCanvasState = useRootStore((state) => state.updateCanvasState);
	const setSelectElements = useRootStore((state) => state.setSelectElements);

	const [simulationSubscription, setSimulationSubscription] = useState<Unsubscribable | null>(
		null,
	);

	async function handleSimulationStart(entryElementId: string) {
		if (!entryElementId) {
			return;
		}

		const { startObservableSimulation } = await import('@maklja/vision-simulator-engine');

		const dispatchObservableEvent = (event: FlowValueEvent) =>
			addObservableEvent({
				id: event.id,
				hash: event.hash,
				index: event.index,
				connectLinesId: [...event.connectLinesId],
				sourceElementId: event.sourceElementId,
				targetElementId: event.targetElementId,
				type: event.type,
				value: event.value,
				subscribeId: event.subscribeId,
			});

		clearErrors();
		startSimulation();
		clearAllSelectedElements();
		const subscription = startObservableSimulation({
			entryElementId,
			elements,
			connectLines,
			onNext: dispatchObservableEvent,
			onError: (error) => {
				dispatchObservableEvent(error);
				subscription.unsubscribe();
			},
			onComplete: () => {
				completeSimulation();
				subscription.unsubscribe();
			},
			onCreationError: (creationErrorEvent) => {
				subscription.unsubscribe();
				resetSimulation();
				createElementError(creationErrorEvent);
			},
		});
		setSimulationSubscription(subscription);
	}

	function handleSimulationStop() {
		simulationSubscription?.unsubscribe();
		setSimulationSubscription(null);
		resetSimulation();
	}

	function handleSimulationReset(entryElementId: string) {
		simulationSubscription?.unsubscribe();
		setSimulationSubscription(null);

		resetSimulation();
		handleSimulationStart(entryElementId);
	}

	function handleElementLocate(element: Element) {
		if (!stage) {
			return;
		}

		const shapeSize = findElementSize(elementSizes, element.type);
		const elementCenter = calculateShapeSizeBoundingBox(
			{ x: element.x, y: element.y },
			shapeSize,
		).center;

		const x = -elementCenter.x + stage.width() / 2;
		const y = -elementCenter.y + stage.height() / 2;

		stage.scale({ x: 1, y: 1 });
		stage.position({
			x,
			y,
		});
		updateCanvasState({
			x,
			y,
			scaleX: 1,
			scaleY: 1,
		});
		clearAllSelectedElements();
		setSelectElements([element.id]);
	}

	return (
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
				entryElements={entryElements}
				onSimulationStart={handleSimulationStart}
				onSimulationStop={handleSimulationStop}
				onSimulationReset={handleSimulationReset}
				onElementLocate={handleElementLocate}
			/>
		</Box>
	);
}

