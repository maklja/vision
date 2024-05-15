import { ElementType } from '@maklja/vision-simulator-model';
import { CircleResultDrawer } from '../../drawers';
import { ElementDrawerProps } from '../ElementDrawerProps';
import { useCircleShapeSize } from '../../store/hooks';

export interface SubscribeResultDrawerProps extends ElementDrawerProps {
	hash: string;
	visibleConnectPoints?: never;
}

export function SubscribeResultDrawer({
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
	onDragBound,
	onMouseDown,
	onMouseUp,
	onMouseOut,
	onMouseOver,
}: SubscribeResultDrawerProps) {
	const elType = ElementType.Subscribe;
	const circleShapeSize = useCircleShapeSize(elType, scale * 0.3);

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
			onDragBound={onDragBound}
			onMouseDown={onMouseDown}
			onMouseUp={onMouseUp}
			onMouseOver={onMouseOver}
			onMouseOut={onMouseOut}
		/>
	);
}

