import { Group } from 'react-konva';
import { useElementDrawerHandlers } from '../state';
import { ElementType, FilterElement } from '../../model';
import { selectDrawerAnimationById } from '../../store/drawerAnimationsSlice';
import { useAppSelector } from '../../store/rootState';
import {
	isHighlightedElement,
	isSelectedElement,
	useCircleShapeSize,
	useRectangleShapeSize,
	useThemeContext,
} from '../../store/stageSlice';
import { ConnectPointsDrawer, createDefaultElementProps } from '../ConnectPointsDrawer';
import { RectangleOperatorDrawer } from '../../drawers';

export interface FilterOperatorDrawerProps {
	element: FilterElement;
	visibleConnectPoints?: boolean;
}

export const FilterOperatorDrawer = ({ element }: FilterOperatorDrawerProps) => {
	const theme = useThemeContext(element.type);
	const animation = useAppSelector(selectDrawerAnimationById(element.id));
	const drawerHandlers = useElementDrawerHandlers();
	const select = useAppSelector(isSelectedElement(element.id));
	const highlight = useAppSelector(isHighlightedElement(element.id));
	const rectangleShapeSize = useRectangleShapeSize(element.type);
	const circleCPSize = useCircleShapeSize(ElementType.ConnectPoint);
	const connectPointsOptions = createDefaultElementProps(element.type, circleCPSize);

	return (
		<Group>
			<ConnectPointsDrawer
				element={element}
				shape={rectangleShapeSize}
				offset={26}
				connectPointsOptions={connectPointsOptions}
			/>
			<RectangleOperatorDrawer
				{...drawerHandlers}
				id={element.id}
				title="Filter"
				size={rectangleShapeSize}
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
