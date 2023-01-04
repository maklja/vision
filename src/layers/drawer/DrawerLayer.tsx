import { Group } from 'react-konva';
import { useAppSelector } from '../../store/rootState';
import { selectStageElements } from '../../store/stageSlice';
import { ElementDrawer } from './ElementDrawer';

export const DrawerLayer = () => {
	const elements = useAppSelector(selectStageElements);

	return (
		<Group>
			{elements.map((el) => (
				<ElementDrawer key={el.id} element={el} />
			))}
		</Group>
	);
};
