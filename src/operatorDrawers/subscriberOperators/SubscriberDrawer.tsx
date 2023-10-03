import { Group } from 'react-konva';
import { DotCircleOperatorDrawer } from '../../drawers';
import { ElementType } from '../../model';
import { useCircleShapeSize } from '../../store/stageSlice';
import { ConnectPointsDrawer } from '../ConnectPointsDrawer';
import { ElementDrawerProps } from '../ElementDrawerProps';

export const SubscriberDrawer = ({
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
	const elType = ElementType.Subscriber;
	const circleShapeSize = useCircleShapeSize(elType, scale);

	return (
		<Group>
			<ConnectPointsDrawer
				id={id}
				x={x}
				y={y}
				scale={scale}
				type={elType}
				shape={circleShapeSize}
				visible={visibleConnectPoints}
			/>
			<DotCircleOperatorDrawer
				id={id}
				size={circleShapeSize}
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
