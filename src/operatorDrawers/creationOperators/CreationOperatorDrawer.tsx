import { Group } from 'react-konva';
import { ElementType } from '../../model';
import { useCircleShapeSize } from '../../store/hooks/theme';
import { ConnectPointsDrawer, createDefaultElementProps } from '../ConnectPointsDrawer';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { CircleOperatorDrawer } from '../../drawers';

export interface CreationOperatorDrawer extends ElementDrawerProps {
	elementType: ElementType;
	title: string;
}

export const CreationOperatorDrawer = ({
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
	onMouseDown,
	onMouseOut,
	onMouseOver,
}: CreationOperatorDrawer) => {
	const circleShapeSize = useCircleShapeSize(elementType, scale);
	const circleCPSize = useCircleShapeSize(ElementType.ConnectPoint, scale);
	const connectPointsOptions = createDefaultElementProps(elementType, circleCPSize);

	return (
		<Group>
			<ConnectPointsDrawer
				id={id}
				x={x}
				y={y}
				type={elementType}
				shape={circleShapeSize}
				offset={26}
				connectPointsOptions={connectPointsOptions}
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
				onMouseDown={onMouseDown}
				onMouseOver={onMouseOver}
				onMouseOut={onMouseOut}
			/>
		</Group>
	);
};

