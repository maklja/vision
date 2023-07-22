import { Group } from 'react-konva';
import { useElementDrawerHandlers } from '../../layers/drawers/state';
import { ElementType, IntervalElement } from '../../model';
import { selectDrawerAnimationById } from '../../store/drawerAnimationsSlice';
import { useAppSelector } from '../../store/rootState';
import {
	isHighlightedElement,
	isSelectedElement,
	useCircleShapeSize,
	useThemeContext,
} from '../../store/stageSlice';
import { ConnectPointsDrawer, createDefaultElementProps } from '../ConnectPointsDrawer';
import { CircleOperatorDrawer } from '../../drawers';

export interface IntervalOperatorDrawerProps {
	element: IntervalElement;
	visibleConnectPoints?: boolean;
}

export const IntervalOperatorDrawer = ({ element }: IntervalOperatorDrawerProps) => {
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
				offset={50}
				connectPointsOptions={connectPointsOptions}
			/>
			<CircleOperatorDrawer
				{...drawerHandlers}
				id={element.id}
				title="Interval"
				size={circleShapeSize}
				theme={theme}
				x={element.x}
				y={element.y}
				animation={animation}
				draggable={true}
				highlight={highlight}
				select={select}
				visible={element.visible}
			/>
		</Group>
	);
};
