import { Group } from 'react-konva';
import { useElementDrawerHandlers } from '../../layers/drawers/state';
import { FromElement } from '../../model';
import { selectDrawerAnimationById } from '../../store/drawerAnimationsSlice';
import { useAppSelector } from '../../store/rootState';
import {
	isHighlightedElement,
	isSelectedElement,
	useCircleShapeSize,
	useThemeContext,
} from '../../store/stageSlice';
import { ConnectPointsWrapperDrawer } from '../ConnectPointsWrapperDrawer';
import { CircleOperatorDrawer } from '../../drawers';

export interface FromOperatorDrawerProps {
	element: FromElement;
	visibleConnectPoints?: boolean;
}

export const FromOperatorDrawer = ({ element }: FromOperatorDrawerProps) => {
	const theme = useThemeContext(element.type);
	const animation = useAppSelector(selectDrawerAnimationById(element.id));
	const drawerHandlers = useElementDrawerHandlers();
	const select = useAppSelector(isSelectedElement(element.id));
	const highlight = useAppSelector(isHighlightedElement(element.id));
	const circleShapeSize = useCircleShapeSize(element.type);

	return (
		<Group>
			<ConnectPointsWrapperDrawer element={element} shape={circleShapeSize} offset={50} />
			<CircleOperatorDrawer
				{...drawerHandlers}
				id={element.id}
				title="From"
				size={circleShapeSize}
				theme={theme}
				x={element.x}
				y={element.y}
				animation={animation}
				draggable={true}
				highlight={highlight}
				select={select}
			/>
		</Group>
	);
};

