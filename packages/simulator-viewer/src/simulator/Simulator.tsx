import Box from '@mui/material/Box';
import Konva from 'konva';
import { useState } from 'react';
import { SimulatorStage } from './SimulatorStage';
import { SimulatorControls } from './SimulatorControls';
import { SimulatorProperties } from './SimulatorProperties';
import { SimulatorOperators } from './SimulatorOperators';
import { SimulatorZoom } from './SimulatorZoom';

export const Simulator = () => {
	const [stage, setStage] = useState<Konva.Stage | null>(null);

	return (
		<Box sx={{ position: 'absolute', width: '100%', height: '100%' }}>
			<SimulatorStage ref={(stageRef) => setStage(stageRef)} />

			<SimulatorControls stage={stage} />

			<SimulatorZoom stage={stage} />

			<SimulatorOperators />

			<SimulatorProperties />
		</Box>
	);
};

