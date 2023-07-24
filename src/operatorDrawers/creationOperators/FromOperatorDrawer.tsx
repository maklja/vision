import { Group } from 'react-konva';
import { ElementType } from '../../model';
import { useCircleShapeSize } from '../../store/stageSlice';
import { ConnectPointsDrawer, createDefaultElementProps } from '../ConnectPointsDrawer';
import { CircleOperatorDrawer } from '../../drawers';
import { ElementDrawerProps } from '../ElementDrawerProps';

export const FromOperatorDrawer = ({
	x,
	y,
	id,
	theme,
	animation,
	draggable,
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
	const elType = ElementType.From;
	const circleShapeSize = useCircleShapeSize(elType);
	const circleCPSize = useCircleShapeSize(ElementType.ConnectPoint);
	const connectPointsOptions = createDefaultElementProps(elType, circleCPSize);

	return (
		<Group>
			<ConnectPointsDrawer
				id={id}
				x={x}
				y={y}
				type={elType}
				shape={circleShapeSize}
				offset={50}
				connectPointsOptions={connectPointsOptions}
				visible={visibleConnectPoints}
			/>
			<CircleOperatorDrawer
				id={id}
				title="From"
				size={circleShapeSize}
				theme={theme}
				x={x}
				y={y}
				animation={animation}
				draggable={draggable}
				highlight={highlight}
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

