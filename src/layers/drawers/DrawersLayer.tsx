import { Layer } from 'react-konva';
import { useAppSelector } from '../../store/rootState';
import { StageState, selectStageElements, selectStageState } from '../../store/stageSlice';
import { OperatorDrawer } from '../../operatorDrawers';

export const DrawersLayer = () => {
	const elements = useAppSelector(selectStageElements);
	const stageState = useAppSelector(selectStageState);
	const dragging = stageState === StageState.Dragging;

	return (
		<Layer>
			{elements.map((el) => (
				<OperatorDrawer key={el.id} element={el} visibleConnectPoints={!dragging} />
			))}
		</Layer>
	);
};

