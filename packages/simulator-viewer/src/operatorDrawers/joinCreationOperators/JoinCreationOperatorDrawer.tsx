import { Group } from 'react-konva';
import { ElementType } from '@maklja/vision-simulator-model';
import { ConnectPointsDrawer } from '../ConnectPointsDrawer';
import { HexagonOperatorDrawer } from '../../drawers';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { useCircleShapeSize } from '../../store/hooks';

export interface JoinCreationOperatorDrawerProps extends ElementDrawerProps {
	elementType: ElementType;
	title: string;
}

export function JoinCreationOperatorDrawer({
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
}: JoinCreationOperatorDrawerProps) {
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
			<HexagonOperatorDrawer
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

