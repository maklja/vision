import Box from '@mui/material/Box';
import { OperatorsPanel } from '../ui';
import { useRootStore } from '../store/rootStore';
import { useShallow } from 'zustand/react/shallow';
import { SimulationState } from '../store/simulation';
import { StageState } from '../store/stage';

export function SimulatorOperators() {
	const operatorsPanelState = useRootStore(
		useShallow((storeState) => {
			const { simulation, state } = storeState;
			const visible =
				simulation.state !== SimulationState.Running && state === StageState.Select;
			const disabled = simulation.state === SimulationState.Running;

			return { visible, disabled };
		}),
	);

	return (
		<Box
			sx={{
				position: 'absolute',
				top: '20%',
				left: '2px',
				width: '70px',
				height: '50%',
			}}
		>
			<OperatorsPanel
				popperVisible={operatorsPanelState.visible}
				disabled={operatorsPanelState.disabled}
			/>
		</Box>
	);
}

