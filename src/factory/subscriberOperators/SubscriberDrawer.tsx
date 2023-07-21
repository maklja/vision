import { Group } from 'react-konva';
import { DotCircleOperatorDrawer } from '../../drawers';
import { useElementDrawerHandlers } from '../../layers/drawers/state';
import { Element } from '../../model';
import { selectDrawerAnimationById } from '../../store/drawerAnimationsSlice';
import { useAppSelector } from '../../store/rootState';
import {
	isHighlightedElement,
	isSelectedElement,
	useCircleShapeSize,
	useThemeContext,
} from '../../store/stageSlice';
import { ConnectPointsWrapperDrawer } from '../ConnectPointsWrapperDrawer';

export interface SubscriberDrawerProps {
	element: Element;
	visibleConnectPoints?: boolean;
}

export const SubscriberDrawer = ({ element }: SubscriberDrawerProps) => {
	const theme = useThemeContext(element.type);
	const animation = useAppSelector(selectDrawerAnimationById(element.id));
	const drawerHandlers = useElementDrawerHandlers();
	const select = useAppSelector(isSelectedElement(element.id));
	const highlight = useAppSelector(isHighlightedElement(element.id));
	const circleShapeSize = useCircleShapeSize(element.type);

	return (
		<Group>
			<ConnectPointsWrapperDrawer element={element} shape={circleShapeSize} offset={42} />
			<DotCircleOperatorDrawer
				{...drawerHandlers}
				id={element.id}
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

