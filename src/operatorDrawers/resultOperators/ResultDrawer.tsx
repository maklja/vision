import { ElementType } from '../../model';
import { useCircleShapeSize } from '../../store/stageSlice';
import { CircleResultDrawer } from '../../drawers';
import { ElementDrawerProps } from '../ElementDrawerProps';

export interface ResultDrawerProps extends ElementDrawerProps {
	hash: string;
	visibleConnectPoints?: never;
}

export const ResultDrawer = ({
	x,
	y,
	scale = 1,
	id,
	theme,
	animation,
	draggable,
	highlight,
	select,
	visible,
	hash,
	onAnimationBegin,
	onAnimationComplete,
	onAnimationDestroy,
	onDragEnd,
	onDragMove,
	onDragStart,
	onMouseDown,
	onMouseOut,
	onMouseOver,
}: ResultDrawerProps) => {
	const elType = ElementType.Result;
	const circleShapeSize = useCircleShapeSize(elType, scale);

	return (
		<CircleResultDrawer
			id={id}
			size={circleShapeSize}
			theme={theme}
			x={x}
			y={y}
			animation={animation}
			draggable={draggable}
			highlight={highlight}
			select={select}
			visible={visible}
			hash={hash}
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
	);
};

