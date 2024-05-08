import { Group } from 'react-konva';
import { ElementType } from '@maklja/vision-simulator-model';
import { ConnectPointsDrawer } from '../ConnectPointsDrawer';
import { RollerOperatorDrawer } from '../../drawers';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { useRectangleShapeSize } from '../../store/hooks';

export interface TransformationOperatorDrawerProps extends ElementDrawerProps {
	elementType: ElementType;
	title: string;
}

export function TransformationOperatorDrawer({
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
	title,
	elementType,
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
}: TransformationOperatorDrawerProps) {
	const rectangleShapeSize = useRectangleShapeSize(elementType, scale);

	return (
		<Group>
			<ConnectPointsDrawer
				id={id}
				x={x}
				y={y}
				type={elementType}
				shape={rectangleShapeSize}
				scale={scale}
				visible={visibleConnectPoints}
			/>
			<RollerOperatorDrawer
				id={id}
				title={title}
				size={rectangleShapeSize}
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

