import Box from '@mui/material/Box';
import { useEffect, useState } from 'react';
import { Unsubscribable } from 'rxjs';
import { useAppDispatch, useAppSelector } from '../store/rootState';
import {
	SimulationState,
	addElement,
	addObservableEvent,
	clearErrors,
	completeSimulation,
	createElementError,
	moveElement,
	removeElement,
	removeSimulationAnimation,
	resetSimulation,
	selectElements,
	selectSimulation,
	selectSimulationNextAnimation,
	selectStage,
	startSimulation,
	updateElement,
} from '../store/stageSlice';
import { SimulatorStage } from './SimulatorStage';
import { addDrawerAnimation, selectDrawerAnimationById } from '../store/drawerAnimationsSlice';
import { MoveAnimation } from '../animation';
import { ElementType, isEntryOperatorType } from '../model';
import { OperatorsPanel, SimulationControls } from '../ui';
import {
	FlowValueEvent,
	MissingNextElementError,
	MissingReferenceObservableError,
	createObservableSimulation,
} from '../engine';

export const Simulator = () => {
	const simulation = useAppSelector(selectSimulation);
	const { elements, connectLines } = useAppSelector(selectStage);
	const nextAnimation = useAppSelector(selectSimulationNextAnimation);
	const drawerAnimation = useAppSelector(
		selectDrawerAnimationById(nextAnimation?.drawerId, nextAnimation?.id),
	);
	const appDispatch = useAppDispatch();
	const [simulationSubscription, setSimulationSubscription] = useState<Unsubscribable | null>(
		null,
	);

	// track when current drawer animation is disposed in order to dequeue it
	useEffect(() => {
		if (!drawerAnimation?.dispose) {
			return;
		}

		appDispatch(removeSimulationAnimation({ animationId: drawerAnimation.id }));
	}, [drawerAnimation?.dispose]);

	useEffect(() => {
		// create result drawer for simulation
		appDispatch(
			addElement({
				id: simulation.id,
				scale: 1,
				x: 0,
				y: 0,
				type: ElementType.Result,
				visible: false,
				properties: {},
			}),
		);

		return () => {
			// clean up result drawer from  simulation
			appDispatch(
				removeElement({
					id: simulation.id,
				}),
			);
		};
	}, [simulation.id]);

	useEffect(() => {
		if (!nextAnimation) {
			appDispatch(
				updateElement({
					id: simulation.id,
					visible: false,
				}),
			);
			return;
		}

		const { drawerId, key, id, data } = nextAnimation;
		// when current animation drawer is result drawer, show it and move it to right position
		// otherwise just hide it
		if (drawerId === simulation.id) {
			// TODO find a better way
			const moveParams = data as MoveAnimation & { hash: string };
			appDispatch(
				updateElement({
					id: simulation.id,
					visible: true,
					properties: {
						hash: moveParams.hash,
					},
				}),
			);
			appDispatch(
				moveElement({
					id: simulation.id,
					x: moveParams.sourcePosition.x,
					y: moveParams.sourcePosition.y,
				}),
			);
		} else {
			appDispatch(
				updateElement({
					id: simulation.id,
					visible: false,
				}),
			);
		}

		// start drawer animation
		appDispatch(
			addDrawerAnimation({
				animationId: id,
				drawerId,
				key,
				data,
			}),
		);
	}, [simulation.animationsQueue, nextAnimation?.id]);

	const dispatchObservableEvent = (event: FlowValueEvent<unknown>) =>
		appDispatch(
			addObservableEvent({
				event: {
					id: event.id,
					hash: event.hash,
					index: event.index,
					connectLinesId: event.connectLinesId,
					sourceElementId: event.sourceElementId,
					targetElementId: event.targetElementId,
					type: event.value.type,
				},
			}),
		);

	const dispatchCompleteEvent = () => appDispatch(completeSimulation());

	const handleSimulationStart = (entryElementId: string) => {
		if (!entryElementId) {
			return;
		}

		try {
			appDispatch(clearErrors());
			appDispatch(startSimulation());
			appDispatch(selectElements([]));
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
				e instanceof MissingNextElementError
			) {
				appDispatch(resetSimulation());
				appDispatch(
					createElementError({
						elementId: e.elementId,
						errorMessage: e.message,
						errorId: e.id,
					}),
				);
				return;
			}

			throw e;
		}
	};

	const handleSimulationStop = () => {
		simulationSubscription?.unsubscribe();
		setSimulationSubscription(null);

		appDispatch(resetSimulation());
	};

	const handleSimulationReset = (entryElementId: string) => {
		simulationSubscription?.unsubscribe();
		setSimulationSubscription(null);

		appDispatch(resetSimulation());
		handleSimulationStart(entryElementId);
	};

	if (!simulation) {
		return null;
	}

	return (
		<Box style={{ position: 'absolute', width: '100%', height: '100%' }}>
			<SimulatorStage />

			<Box
				sx={{
					position: 'absolute',
					top: '15px',
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
					left: '15px',
					width: '70px',
					height: '50%',
				}}
			>
				<OperatorsPanel
					popperVisible={simulation.state !== SimulationState.Running}
					disabled={simulation.state === SimulationState.Running}
				/>
			</Box>
		</Box>
	);
};
