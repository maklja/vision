import { Group } from 'react-konva';
import { ElementType } from '@maklja/vision-simulator-model';
import { useCircleShapeSize } from '../../store/hooks/theme';
import { ConnectPointsDrawer } from '../ConnectPointsDrawer';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { CircleOperatorDrawer } from '../../drawers';

export interface CreationOperatorDrawerProps extends ElementDrawerProps {
	elementType: ElementType;
	title: string;
}

export function CreationOperatorDrawer({
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
	elementType,
	title,
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
}: CreationOperatorDrawerProps) {
	const circleShapeSize = useCircleShapeSize(elementType, scale);

	return (
		<Group>
			<ConnectPointsDrawer
				id={id}
				x={x}
				y={y}
				scale={scale}
				type={elementType}
				shape={circleShapeSize}
				visible={visibleConnectPoints}
			/>
			<CircleOperatorDrawer
				id={id}
				title={title}
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
				onDragBound={onDragBound}
				onMouseDown={onMouseDown}
				onMouseUp={onMouseUp}
				onMouseOver={onMouseOver}
				onMouseOut={onMouseOut}
			/>
		</Group>
	);
}
