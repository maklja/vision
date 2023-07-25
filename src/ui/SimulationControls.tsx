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
import {
	ObservableEventType,
	addNextObservableEvent,
	completeSimulation,
	resetSimulation,
} from '../store/simulationSlice';
import { removeSimulation } from '../store/drawerAnimationsSlice';
import { Unsubscribable } from 'rxjs';
import { useState } from 'react';

export interface SimulationControlsProps {
	simulatorId: string;
	onSimulationStart?: (simulatorId: string) => void;
	onSimulationStop?: (simulatorId: string) => void;
	onSimulationReset?: (simulatorId: string) => void;
}

export const SimulationControls = ({
	simulatorId,
	onSimulationStart,
	onSimulationStop,
	onSimulationReset,
}: SimulationControlsProps) => {
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
		onSimulationStart?.(simulatorId);
	};

	const handleSimulationStop = () => {
		simulationSubscription?.unsubscribe();
		setSimulationSubscription(null);
		onSimulationStop?.(simulatorId);
	};

	const handleSimulationReset = () => {
		simulationSubscription?.unsubscribe();
		setSimulationSubscription(null);

		appDispatch(
			resetSimulation({
				id: simulatorId,
			}),
		);

		// TODO separated step to remove animation, can this be done better?
		appDispatch(
			removeSimulation({
				simulationId: simulatorId,
			}),
		);

		onSimulationReset?.(simulatorId);
		handleSimulationStart();
	};

	const simulationRunning = simulationSubscription != null;
	return (
		<Box
			sx={{
				width: '100%',
				height: '100%',
			}}
		>
			<Paper
				sx={{
					display: 'flex',
					alignItems: 'center',
					width: '100%',
					height: '100%',
					padding: '8px 5px',
				}}
			>
				{!simulationRunning && (
					<IconButton
						aria-label="start simulation"
						color="primary"
						title="Start simulation"
						onClick={handleSimulationStart}
					>
						<PlayArrowIcon fontSize="large" />
					</IconButton>
				)}

				{simulationRunning && (
					<IconButton
						aria-label="reset simulation"
						color="primary"
						title="Reset simulation"
						onClick={handleSimulationReset}
					>
						<RestartAltIcon fontSize="large" />
					</IconButton>
				)}

				<IconButton
					aria-label="stop simulation"
					color="primary"
					disabled={!simulationRunning}
					title="Stop simulation"
					onClick={handleSimulationStop}
				>
					<StopIcon fontSize="large" />
				</IconButton>

				<FormControl sx={{ width: '100%' }} size="small" disabled={simulationRunning}>
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
		</Box>
	);
};

