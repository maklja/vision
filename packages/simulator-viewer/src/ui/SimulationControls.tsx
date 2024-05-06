import { useState, SyntheticEvent } from 'react';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Box from '@mui/material/Box';
import { Element } from '@maklja/vision-simulator-model';
import { SimulationState } from '../store/simulation';

export interface SimulationControlsProps {
	simulatorId: string;
	simulationState: SimulationState;
	entryElements: Element[];
	onSimulationStart?: (entryElementId: string, simulatorId: string) => void;
	onSimulationStop?: (entryElementId: string, simulatorId: string) => void;
	onSimulationReset?: (entryElementId: string, simulatorId: string) => void;
}

export const SimulationControls = ({
	simulatorId,
	simulationState,
	entryElements,
	onSimulationStart,
	onSimulationStop,
	onSimulationReset,
}: SimulationControlsProps) => {
	const [entryElementId, setEntryElementId] = useState<string>('');

	const handleSimulationStart = () => onSimulationStart?.(entryElementId, simulatorId);

	const handleSimulationStop = () => onSimulationStop?.(entryElementId, simulatorId);

	const handleSimulationReset = () => onSimulationReset?.(entryElementId, simulatorId);

	const handleEntryElementChange = (
		_event: SyntheticEvent,
		el: Element<Record<string, unknown>> | null,
	) => setEntryElementId(el?.id ?? '');

	const simulationRunning = simulationState === SimulationState.Running;
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
					padding: '12px 5px',
				}}
			>
				<Autocomplete
					disablePortal
					options={entryElements}
					getOptionLabel={(el) => `${el.type} - ${el.name}`}
					sx={{ width: '100%' }}
					size="small"
					renderInput={(params) => (
						<TextField {...params} size="small" label="Entry operator" />
					)}
					onChange={handleEntryElementChange}
				/>

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
			</Paper>
		</Box>
	);
};
