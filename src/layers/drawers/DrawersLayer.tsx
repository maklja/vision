import { Layer } from 'react-konva';
import { useAppSelector } from '../../store/rootState';
import { OperatorDrawer } from '../../operatorDrawers';
import { selectStageElements } from '../../store/elements';
import { SimulationState, selectSimulation } from '../../store/simulation';
import { StageState, selectStageState } from '../../store/stage';

export const DrawersLayer = () => {
	const simulation = useAppSelector(selectSimulation);
	const elements = useAppSelector(selectStageElements);
	const stageState = useAppSelector(selectStageState);
	const dragging = stageState === StageState.Dragging;

	const isDraggable = simulation.state !== SimulationState.Running;
	return (
		<Layer>
			{elements.map((el) => (
				<OperatorDrawer
					key={el.id}
					element={el}
					visibleConnectPoints={!dragging}
					draggable={isDraggable}
				/>
			))}
		</Layer>
	);
};

