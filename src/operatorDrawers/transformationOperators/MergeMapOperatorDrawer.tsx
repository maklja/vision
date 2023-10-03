import { Group } from 'react-konva';
import { ElementType } from '../../model';
import { useRectangleShapeSize } from '../../store/stageSlice';
import { ConnectPointsDrawer } from '../ConnectPointsDrawer';
import { RollerOperatorDrawer } from '../../drawers';
import { ElementDrawerProps } from '../ElementDrawerProps';

export const MergeMapOperatorDrawer = ({
	x,
	y,
	scale = 1,
	id,
	theme,
	animation,
	draggable,
	hasError,
	highlight,
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
	onMouseOut,
	onMouseOver,
}: ElementDrawerProps) => {
	const elType = ElementType.MergeMap;
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
			<RollerOperatorDrawer
				id={id}
				title={'Merge\nMap'}
				size={rectangleShapeSize}
				theme={theme}
				x={x}
				y={y}
				animation={animation}
				draggable={draggable}
				highlight={highlight}
				select={select}
				visible={visible}
				hasError={hasError}
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

