import { Group } from 'react-konva';
import { ElementType } from '../../model';
import { useCircleShapeSize } from '../../store/stageSlice';
import { ConnectPointsDrawer } from '../ConnectPointsDrawer';
import { CheckCircleIconDrawer, CircleOperatorDrawer, CloseCircleIconDrawer } from '../../drawers';
import { ElementDrawerProps } from '../ElementDrawerProps';

export const IifOperatorDrawer = ({
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
	const elType = ElementType.IIf;
	const circleShapeSize = useCircleShapeSize(elType, scale);
	const circleCPSize = useCircleShapeSize(ElementType.ConnectPoint, scale);

	return (
		<Group>
			<ConnectPointsDrawer
				id={id}
				x={x}
				y={y}
				scale={scale}
				type={elType}
				shape={circleShapeSize}
				offset={26}
				visible={visibleConnectPoints}
				icons={{
					top: ({ connectPointPosition, theme, highlight }) => (
						<CheckCircleIconDrawer
							connectPointPosition={connectPointPosition}
							theme={theme}
							highlight={highlight}
							size={circleCPSize}
						/>
					),
					bottom: ({ connectPointPosition, theme, highlight }) => (
						<CloseCircleIconDrawer
							connectPointPosition={connectPointPosition}
							theme={theme}
							highlight={highlight}
							size={circleCPSize}
						/>
					),
				}}
			/>
			<CircleOperatorDrawer
				id={id}
				title="Iif"
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
