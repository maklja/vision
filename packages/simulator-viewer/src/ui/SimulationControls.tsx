import { useState, SyntheticEvent, MouseEvent } from 'react';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import LocationSearchingIcon from '@mui/icons-material/LocationSearching';
import { Element } from '@maklja/vision-simulator-model';
import { SimulationState } from '../store/simulation';

interface ElementAutocompleteOptionProps {
	element: Element;
	onElementLocate?: (element: Element) => void;
}

function ElementAutocompleteOption({ element, onElementLocate }: ElementAutocompleteOptionProps) {
	function handleElementLocate(event: MouseEvent) {
		event.stopPropagation();
		onElementLocate?.(element);
	}

	return (
		<Stack direction="row" width="100%" justifyContent="space-between" alignItems="center">
			<div>{`${element.type} - ${element.name}`}</div>
			<IconButton size="small" onClick={(e) => handleElementLocate(e)}>
				<LocationSearchingIcon />
			</IconButton>
		</Stack>
	);
}

export interface SimulationControlsProps {
	simulatorId: string;
	simulationState: SimulationState;
	entryElements: Element[];
	onSimulationStart?: (entryElementId: string, simulatorId: string) => void;
	onSimulationStop?: (entryElementId: string, simulatorId: string) => void;
	onSimulationReset?: (entryElementId: string, simulatorId: string) => void;
	onElementLocate?: (element: Element) => void;
}

export function SimulationControls({
	simulatorId,
	simulationState,
	entryElements,
	onSimulationStart,
	onSimulationStop,
	onSimulationReset,
	onElementLocate,
}: SimulationControlsProps) {
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
					renderOption={(props, el) => (
						<Box {...props} key={el.id} component="li">
							<ElementAutocompleteOption
								element={el}
								onElementLocate={onElementLocate}
							/>
						</Box>
					)}
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
}

