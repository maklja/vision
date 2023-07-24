import { Group } from 'react-konva';
import { DotCircleOperatorDrawer } from '../../drawers';
import { useElementDrawerHandlers } from '../state';
import { Element, ElementType } from '../../model';
import { selectDrawerAnimationById } from '../../store/drawerAnimationsSlice';
import { useAppSelector } from '../../store/rootState';
import {
	isHighlightedElement,
	isSelectedElement,
	useCircleShapeSize,
	useThemeContext,
} from '../../store/stageSlice';
import { ConnectPointsDrawer, createDefaultElementProps } from '../ConnectPointsDrawer';

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
	const circleCPSize = useCircleShapeSize(ElementType.ConnectPoint);
	const connectPointsOptions = createDefaultElementProps(element.type, circleCPSize);

	return (
		<Group>
			<ConnectPointsDrawer
				element={element}
				shape={circleShapeSize}
				offset={42}
				connectPointsOptions={connectPointsOptions}
			/>
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
