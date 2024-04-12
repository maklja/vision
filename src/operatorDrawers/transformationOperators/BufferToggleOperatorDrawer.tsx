import { Group } from 'react-konva';
import { ElementType } from '../../model';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { ConnectPointsDrawer } from '../ConnectPointsDrawer';
import { CheckCircleIconDrawer, CloseCircleIconDrawer, RollerOperatorDrawer } from '../../drawers';
import { useCircleShapeSize, useRectangleShapeSize } from '../../store/rootStateNew';

export function BufferToggleOperatorDrawer({
	x,
	y,
	id,
	scale = 1,
	theme,
	highlight,
	select,
	visible = true,
	animation,
	draggable = false,
	draggableSnap = false,
	hasError = false,
	visibleConnectPoints,
	onMouseOver,
	onMouseOut,
	onMouseDown,
	onMouseUp,
	onDragMove,
	onDragStart,
	onDragEnd,
	onAnimationBegin,
	onAnimationComplete,
	onAnimationDestroy,
}: ElementDrawerProps) {
	const elType = ElementType.BufferToggle;
	const rectangleShapeSize = useRectangleShapeSize(elType, scale);
	const circleCPSize = useCircleShapeSize(ElementType.ConnectPoint, scale);

	return (
		<Group>
			<ConnectPointsDrawer
				id={id}
				x={x}
				y={y}
				type={elType}
				shape={rectangleShapeSize}
				scale={scale}
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
			<RollerOperatorDrawer
				id={id}
				title={'Buffer\nToggle'}
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
}

