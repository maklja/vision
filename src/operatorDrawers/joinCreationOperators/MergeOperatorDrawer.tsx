import { Group } from 'react-konva';
import { ElementType } from '../../model';
import { useCircleShapeSize } from '../../store/stageSlice';
import { ConnectPointsDrawer, createDefaultElementProps } from '../ConnectPointsDrawer';
import { HexagonOperatorDrawer } from '../../drawers';
import { ElementDrawerProps } from '../ElementDrawerProps';

export const MergeOperatorDrawer = ({
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
	const elType = ElementType.Merge;
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
				offset={26}
				connectPointsOptions={connectPointsOptions}
				visible={visibleConnectPoints}
			/>
			<HexagonOperatorDrawer
				id={id}
				title="Merge"
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

