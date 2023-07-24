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
import { OperatorsPanel } from '../ui';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import StopIcon from '@mui/icons-material/Stop';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

export const Simulator = () => {
	const [simulatorId] = useState(v1());
	const simulationStep = useRef(0);
	const [simulationSubscription, setSimulationSubscription] = useState<Unsubscribable | null>(
		null,
	);
	const { elements, connectLines } = useAppSelector(selectStage);
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

	const dispatchNextEvent = (event: FlowValueEvent<unknown>) =>
		appDispatch(
			addNextObservableEvent({
				id: simulatorId,
				nextEvent: {
					...event,
					type: ObservableEventType.Next,
				},
			}),
		);

	const dispatchErrorEvent = (event: FlowErrorEvent<unknown>) =>
		appDispatch(
			addNextObservableEvent({
				id: simulatorId,
				nextEvent: {
					...event,
					type: ObservableEventType.Error,
				},
			}),
		);

	const dispatchCompleteEvent = () =>
		appDispatch(
			completeSimulation({
				id: simulatorId,
			}),
		);

	const handleSimulationStart = () => {
		const subscription = createObservableSimulation(
			'intervalElement',
			elements,
			connectLines,
		).start({
			next: dispatchNextEvent,
			error: dispatchErrorEvent,
			complete: dispatchCompleteEvent,
		});
		setSimulationSubscription(subscription);
	};

	const handleSimulationStop = () => {
		simulationSubscription?.unsubscribe();
		setSimulationSubscription(null);
	};

	const handleSimulationReset = () => {
		simulationSubscription?.unsubscribe();
		setSimulationSubscription(null);

		appDispatch(
			resetSimulation({
				id: simulatorId,
			}),
		);
		appDispatch(
			removeSimulation({
				simulationId: simulatorId,
			}),
		);
	};

	if (!simulation) {
		return null;
	}

	return (
		<Box style={{ position: 'absolute', width: '100%', height: '100%' }}>
			{/* <button onClick={handleSimulationStart}>Start simulation</button>
			<button onClick={handleSimulationStop}>Stop simulation</button>
			<button onClick={handleSimulationReset}>Reset simulation</button> */}

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
				<div>
					<Paper sx={{ width: '100%', height: '100%' }}>
						<IconButton aria-label="start simulation" color="primary">
							<PlayArrowIcon fontSize="large" />
						</IconButton>

						<IconButton aria-label="reset simulation" color="primary">
							<RestartAltIcon fontSize="large" />
						</IconButton>

						<IconButton aria-label="stop simulation" color="primary">
							<StopIcon fontSize="large" />
						</IconButton>

						<FormControl sx={{ m: 1, minWidth: 170 }} size="small">
							<InputLabel id="entry-operator">Entry operator</InputLabel>
							<Select labelId="entry-operator" value={''} label="Entry operator">
								<MenuItem value="">
									<em>None</em>
								</MenuItem>
								<MenuItem value={10}>Ten</MenuItem>
								<MenuItem value={20}>Twenty</MenuItem>
								<MenuItem value={30}>Thirty</MenuItem>
							</Select>
						</FormControl>
					</Paper>
				</div>
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

