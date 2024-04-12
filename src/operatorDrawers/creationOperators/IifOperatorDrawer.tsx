import { Group } from 'react-konva';
import { ElementType } from '../../model';
import { ConnectPointsDrawer } from '../ConnectPointsDrawer';
import { CheckCircleIconDrawer, CircleOperatorDrawer, CloseCircleIconDrawer } from '../../drawers';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { useCircleShapeSize } from '../../store/rootStateNew';

export const IifOperatorDrawer = ({
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

