import { Layer } from 'react-konva';
import { useAppSelector } from '../../store/rootState';
import { ConnectLineDrawer } from '../../operatorDrawers';
import { selectStageConnectLines } from '../../store/connectLines';
import { SimulationState, selectSimulation } from '../../store/simulation';

export const ConnectLinesLayer = () => {
	const simulation = useAppSelector(selectSimulation);
	const connectLines = useAppSelector(selectStageConnectLines);

	const isDraggable = simulation.state !== SimulationState.Running;
	return (
		<Layer>
			{connectLines.map((cl) => (
				<ConnectLineDrawer key={cl.id} connectLine={cl} draggable={isDraggable} />
			))}
		</Layer>
	);
};
