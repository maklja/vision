import { useState } from 'react';
import { Unsubscribable } from 'rxjs';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem/MenuItem';
import Paper from '@mui/material/Paper';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Box from '@mui/material/Box';
import { useAppDispatch, useAppSelector } from '../store/rootState';
import { FlowErrorEvent, FlowValue, FlowValueEvent, createObservableSimulation } from '../engine';
import {
	ObservableEventType,
	addNextObservableEvent,
	completeSimulation,
	resetSimulation,
	selectStage,
} from '../store/stageSlice';
import { isEntryOperatorType } from '../model';

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
	const [entryElementId, setEntryElementId] = useState<string>('');
	const { elements, connectLines } = useAppSelector(selectStage);

	const dispatchNextEvent = (event: FlowValueEvent<unknown>) =>
		appDispatch(
			addNextObservableEvent({
				nextEvent: {
					...event,
					value: (event.value as FlowValue).value,
					type: ObservableEventType.Next,
				},
			}),
		);

	const dispatchErrorEvent = (event: FlowErrorEvent<FlowValue>) =>
		appDispatch(
			addNextObservableEvent({
				nextEvent: {
					...event,
					value: event.error,
					type: ObservableEventType.Error,
				},
			}),
		);

	const dispatchCompleteEvent = () => appDispatch(completeSimulation());

	const handleSimulationStart = () => {
		if (!entryElementId) {
			return;
		}

		const subscription = createObservableSimulation(
			entryElementId,
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

		appDispatch(resetSimulation());
		onSimulationStop?.(simulatorId);
	};

	const handleSimulationReset = () => {
		simulationSubscription?.unsubscribe();
		setSimulationSubscription(null);

		appDispatch(resetSimulation());
		onSimulationReset?.(simulatorId);
		handleSimulationStart();
	};

	const handleEntryElementChange = (event: SelectChangeEvent) => {
		setEntryElementId(event.target.value);
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
					padding: '11px 5px',
				}}
			>
				{!simulationRunning && (
					<IconButton
						aria-label="start simulation"
						color="primary"
						title="Start simulation"
						onClick={handleSimulationStart}
						disabled={!entryElementId}
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
					<Select
						labelId="entry-operator"
						value={entryElementId}
						label="Entry operator"
						onChange={handleEntryElementChange}
					>
						{elements
							.filter((el) => isEntryOperatorType(el.type))
							.map((el) => (
								<MenuItem key={el.id} value={el.id}>
									{el.type}
								</MenuItem>
							))}
					</Select>
				</FormControl>
			</Paper>
		</Box>
	);
};
