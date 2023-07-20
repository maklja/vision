import { Layer } from 'react-konva';
import { useAppSelector } from '../../store/rootState';
import { selectStageElements } from '../../store/stageSlice';
import { ElementDrawer } from './ElementDrawer';

export const DrawersLayer = () => {
	const elements = useAppSelector(selectStageElements);

	return (
		<Layer>
			{elements.map((el) => (
				<ElementDrawer key={el.id} element={el} />
			))}
		</Layer>
	);
};

