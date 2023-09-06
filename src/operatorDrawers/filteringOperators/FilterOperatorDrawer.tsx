import { Group } from 'react-konva';
import { ElementType } from '../../model';
import { useCircleShapeSize, useRectangleShapeSize } from '../../store/stageSlice';
import { ConnectPointsDrawer, createDefaultElementProps } from '../ConnectPointsDrawer';
import { RectangleOperatorDrawer } from '../../drawers';
import { ElementDrawerProps } from '../ElementDrawerProps';

export const FilterOperatorDrawer = ({
	x,
	y,
	scale = 1,
	id,
	theme,
	animation,
	draggable,
	highlight,
	hasError,
	select,
	visible,
	visibleConnectPoints,
	properties,
	onAnimationBegin,
	onAnimationComplete,
	onAnimationDestroy,
	onDragEnd,
	onDragMove,
	onDragStart,
	onMouseDown,
	onMouseOut,
	onMouseOver,
}: ElementDrawerProps) => {
	const elType = ElementType.Filter;
	const rectangleShapeSize = useRectangleShapeSize(elType, scale);
	const circleCPSize = useCircleShapeSize(ElementType.ConnectPoint, scale);
	const connectPointsOptions = createDefaultElementProps(elType, properties, circleCPSize);

	return (
		<Group>
			<ConnectPointsDrawer
				id={id}
				x={x}
				y={y}
				type={elType}
				shape={rectangleShapeSize}
				offset={26}
				connectPointsOptions={connectPointsOptions}
				visible={visibleConnectPoints}
			/>
			<RectangleOperatorDrawer
				id={id}
				title="Filter"
				size={rectangleShapeSize}
				theme={theme}
				x={x}
				y={y}
				animation={animation}
				draggable={draggable}
				highlight={highlight}
				hasError={hasError}
				select={select}
				visible={visible}
				onAnimationBegin={onAnimationBegin}
				onAnimationComplete={onAnimationComplete}
				onAnimationDestroy={onAnimationDestroy}
				onDragStart={onDragStart}
				onDragMove={onDragMove}
				onDragEnd={onDragEnd}
				onMouseDown={onMouseDown}
				onMouseOver={onMouseOver}
				onMouseOut={onMouseOut}
			/>
		</Group>
	);
};

