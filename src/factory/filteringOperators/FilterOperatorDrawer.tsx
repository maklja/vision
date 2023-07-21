import { Group } from 'react-konva';
import { useElementDrawerHandlers } from '../../layers/drawers/state';
import { FilterElement } from '../../model';
import { selectDrawerAnimationById } from '../../store/drawerAnimationsSlice';
import { useAppSelector } from '../../store/rootState';
import {
	isHighlightedElement,
	isSelectedElement,
	useRectangleShapeSize,
	useThemeContext,
} from '../../store/stageSlice';
import { ConnectPointsWrapperDrawer } from '../ConnectPointsWrapperDrawer';
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

	return (
		<Group>
			<ConnectPointsWrapperDrawer element={element} shape={rectangleShapeSize} offset={50} />
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
			/>
		</Group>
	);
};

