import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { Box } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store/rootState';
import { FlowErrorEvent, FlowValueEvent, createObservableSimulation } from '../engine';
import { selectStage } from '../store/stageSlice';
import { ObservableEventType, addNextObservableEvent, completeSimulation, resetSimulation } from '../store/simulationSlice';
import { removeSimulation } from '../store/drawerAnimationsSlice';
import { Unsubscribable } from 'rxjs';
import { useState } from 'react';

export const SimulationControls = () => {
	const appDispatch = useAppDispatch();
	const [simulationSubscription, setSimulationSubscription] = useState<Unsubscribable | null>(
		null,
	);
	const { elements, connectLines } = useAppSelector(selectStage);

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

	return (
		<Paper>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					width: '100%',
					height: '100%',
				}}
			>
				<IconButton aria-label="start simulation" color="primary">
					<PlayArrowIcon fontSize="large" />
				</IconButton>

				<IconButton aria-label="reset simulation" color="primary">
					<RestartAltIcon fontSize="large" />
				</IconButton>

				<IconButton aria-label="stop simulation" color="primary" disabled={true}>
					<StopIcon fontSize="large" />
				</IconButton>

				<FormControl sx={{ width: '100%' }} size="small">
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
			</Box>
		</Paper>
	);
};
