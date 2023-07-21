import { Layer } from 'react-konva';
import { useAppSelector } from '../../store/rootState';
import { StageState, selectStageElements, selectStageState } from '../../store/stageSlice';
import { ElementWrapperDrawer } from '../../factory';

export const DrawersLayer = () => {
	const elements = useAppSelector(selectStageElements);
	const stageState = useAppSelector(selectStageState);
	const dragging = stageState === StageState.Dragging;

	return (
		<Layer>
			{elements.map((el) => (
				<ElementWrapperDrawer key={el.id} element={el} visibleConnectPoints={!dragging} />
			))}
		</Layer>
	);
};

