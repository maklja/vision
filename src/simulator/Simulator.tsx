import Box from '@mui/material/Box';
import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/rootState';
import {
	addElement,
	moveElement,
	removeElement,
	removeSimulationAnimation,
	selectSimulation,
	selectSimulationNextAnimation,
	updateElement,
} from '../store/stageSlice';
import { SimulatorStage } from './SimulatorStage';
import { addDrawerAnimation, selectDrawerAnimationById } from '../store/drawerAnimationsSlice';
import { MoveAnimation } from '../animation';
import { ElementType } from '../model';
import { OperatorsPanel, SimulationControls } from '../ui';

export const Simulator = () => {
	const simulationStep = useRef(0);
	const simulation = useAppSelector(selectSimulation);
	const nextAnimation = useAppSelector(selectSimulationNextAnimation);
	const a = useAppSelector(
		selectDrawerAnimationById(nextAnimation?.drawerId ?? '', nextAnimation?.id ?? ''),
	);
	const appDispatch = useAppDispatch();

	useEffect(() => {
		if (!a?.dispose) {
			return;
		}

		appDispatch(removeSimulationAnimation({ animationId: a.id }));
	}, [a?.dispose]);

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
	}, [nextAnimation?.id]);

	const handleSimulationStop = () => {
		simulationStep.current = 0;
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
					onSimulationStop={handleSimulationStop}
					onSimulationReset={handleSimulationStop}
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
				<OperatorsPanel />
			</Box>
		</Box>
	);
};
