import { Group } from 'react-konva';
import { ElementType } from '../../model';
import { ConnectPointsDrawer } from '../ConnectPointsDrawer';
import { RectangleOperatorDrawer } from '../../drawers';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { useRectangleShapeSize } from '../../store/rootStateNew';

export const FilterOperatorDrawer = ({
	x,
	y,
	scale = 1,
	id,
	theme,
	animation,
	draggable,
	draggableSnap,
	highlight,
	hasError,
	select,
	visible,
	visibleConnectPoints,
	onAnimationBegin,
	onAnimationComplete,
	onAnimationDestroy,
	onDragEnd,
	onDragMove,
	onDragStart,
	onMouseDown,
	onMouseUp,
	onMouseOut,
	onMouseOver,
}: ElementDrawerProps) => {
	const elType = ElementType.Filter;
	const rectangleShapeSize = useRectangleShapeSize(elType, scale);

	return (
		<Group>
			<ConnectPointsDrawer
				id={id}
				x={x}
				y={y}
				scale={scale}
				type={elType}
				shape={rectangleShapeSize}
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
				draggableSnap={draggableSnap}
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
				onMouseUp={onMouseUp}
				onMouseOver={onMouseOver}
				onMouseOut={onMouseOut}
			/>
		</Group>
	);
};

