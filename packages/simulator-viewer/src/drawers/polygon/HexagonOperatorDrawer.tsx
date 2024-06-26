import { useState } from 'react';
import Konva from 'konva';
import { RegularPolygon, Group, Text } from 'react-konva';
import { CircleDrawerProps } from '../DrawerProps';
import { useElementDrawerTheme } from '../../theme';
import { useAnimation } from '../../animation';
import { handleDragBoundFunc } from '../utils';

export interface HexagonOperatorDrawerProps extends CircleDrawerProps {
	title: string;
}

export function HexagonOperatorDrawer({
	x,
	y,
	title,
	size,
	highlight,
	select,
	visible = true,
	id,
	theme,
	animation,
	draggable = false,
	hasError = false,
	onMouseOver,
	onMouseOut,
	onMouseDown,
	onMouseUp,
	onDragMove,
	onDragStart,
	onDragEnd,
	onDragBound,
	onAnimationDestroy,
	onAnimationBegin,
	onAnimationComplete,
}: HexagonOperatorDrawerProps) {
	const drawerStyle = useElementDrawerTheme(theme, {
		highlight,
		select,
		hasError,
	});
	const { radius, fontSizes } = size;
	const [mainShapeRef, setMainShapeRef] = useState<Konva.Circle | null>(null);
	const [mainTextRef, setMainTextRef] = useState<Konva.Text | null>(null);

	useAnimation(
		animation,
		[
			[mainShapeRef, animation?.mainShape],
			[mainTextRef, animation?.text],
		],
		{
			onAnimationBegin,
			onAnimationComplete,
			onAnimationDestroy,
			drawerId: id,
		},
	);

	const textX = radius - (mainTextRef?.width() ?? 0) / 2;
	const textY = radius - (mainTextRef?.height() ?? 0) / 2;

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
			visible={visible && Boolean(mainTextRef && mainShapeRef)}
			draggable={draggable}
			dragBoundFunc={handleDragBoundFunc(id, onDragBound)}
			x={x}
			y={y}
			onMouseOver={handleMouseOver}
			onMouseOut={handleMouseOut}
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
			onDragMove={handleDragMove}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<RegularPolygon
				{...drawerStyle.element.primary}
				sides={8}
				ref={(ref) => setMainShapeRef(ref)}
				id={id}
				radius={radius}
				x={radius}
				y={radius}
			/>
			<Text
				{...drawerStyle.text}
				ref={(ref) => setMainTextRef(ref)}
				text={title}
				x={textX}
				y={textY}
				fontSize={fontSizes.primary}
				listening={false}
				align="center"
				verticalAlign="middle"
			/>
		</Group>
	);
}

