import { useState } from 'react';
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
import { Element } from '../model';
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

	const handleEntryElementChange = (event: SelectChangeEvent) =>
		setEntryElementId(event.target.value);

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
						{entryElements.map((el) => (
							<MenuItem key={el.id} value={el.id}>
								{el.type} - {el.name}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</Paper>
		</Box>
	);
};
