import Konva from 'konva';
import { Circle, Group } from 'react-konva';
import { CircleDrawerProps } from '../DrawerProps';
import { useState } from 'react';
import { useAnimation } from '../../animation';
import { useCircleSizeScale, useElementDrawerTheme } from '../../theme';
import { handleDragBoundFunc } from '../utils';

export function DotCircleOperatorDrawer({
	x,
	y,
	size,
	id,
	theme,
	highlight,
	select,
	animation,
	visible,
	draggable = false,
	hasError = false,
	onMouseDown,
	onMouseUp,
	onMouseOut,
	onMouseOver,
	onDragMove,
	onDragStart,
	onDragEnd,
	onDragBound,
	onAnimationBegin,
	onAnimationComplete,
	onAnimationDestroy,
}: CircleDrawerProps) {
	const drawerStyle = useElementDrawerTheme(theme, {
		highlight,
		select,
		hasError,
	});
	const [mainShapeRef, setMainShapeRef] = useState<Konva.Circle | null>(null);
	const [innerShapeRef, setInnerShapeRef] = useState<Konva.Circle | null>(null);

	useAnimation(
		animation,
		[
			[mainShapeRef, animation?.mainShape],
			[innerShapeRef, animation?.secondaryShape],
		],
		{
			onAnimationBegin,
			onAnimationComplete,
			onAnimationDestroy,
			drawerId: id,
		},
	);

	const innerSizes = useCircleSizeScale(size, 0.6);
	const handleMouseOver = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onMouseOver?.({
			id,
			originalEvent: e,
		});

	const handleMouseOut = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onMouseOut?.({
			id,
			originalEvent: e,
		});

	const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onMouseDown?.({
			id,
			originalEvent: e,
		});

	const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onMouseUp?.({
			id,
			originalEvent: e,
		});

	const handleDragMove = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onDragMove?.({
			id,
			originalEvent: e,
		});

	const handleDragStart = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onDragStart?.({
			id,
			originalEvent: e,
		});

	const handleDragEnd = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onDragEnd?.({
			id,
			originalEvent: e,
		});

	return (
		<Group
			visible={visible && Boolean(mainShapeRef)}
			x={x}
			y={y}
			draggable={draggable}
			dragBoundFunc={handleDragBoundFunc(id, onDragBound)}
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
			onMouseOver={handleMouseOver}
			onMouseOut={handleMouseOut}
			onDragMove={handleDragMove}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<Circle
				{...drawerStyle.element.primary}
				ref={(node) => setMainShapeRef(node)}
				id={id}
				radius={size.radius}
				x={size.radius}
				y={size.radius}
			/>
			<Circle
				{...drawerStyle.element.secondary}
				ref={(node) => setInnerShapeRef(node)}
				radius={innerSizes.radius}
				x={size.radius}
				y={size.radius}
				listening={false}
			/>
		</Group>
	);
}

