import { ResultElement } from '../../model';
import { useCircleShapeSize, useThemeContext } from '../../store/stageSlice';
import { useAppSelector } from '../../store/rootState';
import { selectDrawerAnimationById } from '../../store/drawerAnimationsSlice';
import { useElementDrawerHandlers } from '../../layers/drawers/state';
import { CircleResultDrawer } from '../../drawers';

export interface ResultDrawerProps {
	element: ResultElement;
}

export const ResultDrawer = ({ element }: ResultDrawerProps) => {
	const theme = useThemeContext(element.type);
	const animation = useAppSelector(selectDrawerAnimationById(element.id));
	const drawerHandlers = useElementDrawerHandlers();
	const circleShapeSize = useCircleShapeSize(element.type);

	return (
		<CircleResultDrawer
			{...drawerHandlers}
			id={element.id}
			hash={element.properties.hash}
			size={circleShapeSize}
			theme={theme}
			x={element.x}
			y={element.y}
			animation={animation}
			visible={element.visible}
		/>
	);
};
