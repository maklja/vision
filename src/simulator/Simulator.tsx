import { useEffect, useRef, useState } from 'react';
import { Unsubscribable } from 'rxjs';
import { v1 } from 'uuid';
import { createObservableSimulation, FlowErrorEvent, FlowValueEvent } from '../engine';
import { useAppDispatch, useAppSelector } from '../store/rootState';
import {
	addNextObservableEvent,
	completeSimulation,
	createSimulation,
	ObservableEvent,
	ObservableEventType,
	resetSimulation,
	selectSimulationById,
} from '../store/simulationSlice';
import {
	addElement,
	moveElement,
	removeElement,
	selectStage,
	updateElement,
} from '../store/stageSlice';
import { SimulatorStage } from './SimulatorStage';
import {
	addDrawerAnimation,
	addSimulationAnimations,
	removeSimulation,
	selectSimulationNextAnimation,
} from '../store/drawerAnimationsSlice';
import { MoveAnimation } from '../animation';
import { ElementType } from '../model';
import { createAnimations } from './createAnimations';
import Box from '@mui/material/Box';
import { OperatorsPanel, SimulationControls } from '../ui';

export const Simulator = () => {
	const [simulatorId] = useState(v1());
	const simulationStep = useRef(0);
	const { connectLines } = useAppSelector(selectStage);
	const simulation = useAppSelector(selectSimulationById(simulatorId));
	const nextAnimation = useAppSelector(selectSimulationNextAnimation(simulatorId));
	const appDispatch = useAppDispatch();

	useEffect(() => {
		// case when simulation changes
		if (simulation?.id === simulatorId) {
			return;
		}

		// create a new simulation
		appDispatch(
			createSimulation({
				id: simulatorId,
				events: [],
				completed: false,
			}),
		);

		// create result drawer for simulation
		appDispatch(
			addElement({
				id: simulatorId,
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
					id: simulatorId,
				}),
			);
		};
	}, [simulatorId]);

	useEffect(() => {
		if (!simulation) {
			return;
		}

		const { events } = simulation;
		if (events.length === 0 || events.length === simulationStep.current) {
			return;
		}

		// create simulation animations for each drawer that is affected by events
		const animations = events
			.slice(simulationStep.current)
			.reduce((group: (ObservableEvent | null)[][], currentEvent, i) => {
				// group simulation events by [previousEvent, currentEvent]
				// so you could determine if it required to show previous drawer animation
				const prevEvent = events[simulationStep.current + i - 1];
				if (!prevEvent) {
					return [...group, [null, currentEvent]];
				}

				return [...group, [prevEvent, currentEvent]];
			}, [])
			.map((eventsPair) => {
				return createAnimations(eventsPair, connectLines, simulatorId);
			})
			.flat();

		// queue simulation animations
		appDispatch(
			addSimulationAnimations({
				animations,
				simulationId: simulatorId,
			}),
		);
		simulationStep.current = events.length;
	}, [simulation?.events]);

	useEffect(() => {
		if (!nextAnimation) {
			return;
		}

		const { drawerId, key, id, simulationId, data } = nextAnimation;
		// when current animation drawer is result drawer, show it and move it to right position
		// otherwise just hide it
		if (drawerId === simulatorId) {
			// TODO find a better way
			const moveParams = data as MoveAnimation & { hash: string };
			appDispatch(
				updateElement({
					id: simulatorId,
					visible: true,
					properties: {
						hash: moveParams.hash,
					},
				}),
			);
			appDispatch(
				moveElement({
					id: simulatorId,
					x: moveParams.sourcePosition.x,
					y: moveParams.sourcePosition.y,
				}),
			);
		} else {
			appDispatch(
				updateElement({
					id: simulatorId,
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
				simulationId,
				data,
			}),
		);
	}, [nextAnimation?.id]);



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
				<SimulationControls />
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
				<OperatorsPanel />
			</Box>
		</Box>
	);
};
