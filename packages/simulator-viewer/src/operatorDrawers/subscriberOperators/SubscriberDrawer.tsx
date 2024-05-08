import { Group } from 'react-konva';
import { ElementType } from '@maklja/vision-simulator-model';
import { DotCircleOperatorDrawer } from '../../drawers';
import { ConnectPointsDrawer } from '../ConnectPointsDrawer';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { useCircleShapeSize } from '../../store/hooks';

export function SubscriberDrawer({
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
	disabled,
	onAnimationBegin,
	onAnimationComplete,
	onAnimationDestroy,
	onDragEnd,
	onDragMove,
	onDragStart,
	onDragBound,
	onMouseDown,
	onMouseUp,
	onMouseOut,
	onMouseOver,
}: ElementDrawerProps) {
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
				disabled={disabled}
				onAnimationBegin={onAnimationBegin}
				onAnimationComplete={onAnimationComplete}
				onAnimationDestroy={onAnimationDestroy}
				onDragStart={onDragStart}
				onDragMove={onDragMove}
				onDragEnd={onDragEnd}
				onDragBound={onDragBound}
				onMouseDown={onMouseDown}
				onMouseUp={onMouseUp}
				onMouseOver={onMouseOver}
				onMouseOut={onMouseOut}
			/>
		</Group>
	);
}

