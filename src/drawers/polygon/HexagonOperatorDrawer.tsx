import { useState } from 'react';
import Konva from 'konva';
import { Vector2d } from 'konva/lib/types';
import { Node } from 'konva/lib/Node';
import { RegularPolygon, Group, Text } from 'react-konva';
import { CircleDrawerProps } from '../DrawerProps';
import { useElementDrawerTheme, useGridTheme } from '../../theme';
import { useAnimationGroups } from '../../animation';
import { dragBoundFuncHandler } from '../utils';

export interface HexagonOperatorDrawerProps extends CircleDrawerProps {
	title: string;
}

export const HexagonOperatorDrawer = ({
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
	draggableSnap = false,
	hasError = false,
	onMouseOver,
	onMouseOut,
	onMouseDown,
	onMouseUp,
	onDragMove,
	onDragStart,
	onDragEnd,
	onAnimationDestroy,
	onAnimationBegin,
	onAnimationComplete,
}: HexagonOperatorDrawerProps) => {
	const drawerStyle = useElementDrawerTheme(theme, {
		highlight,
		select,
		hasError,
	});
	const gridTheme = useGridTheme(theme);
	const { radius, fontSizes } = size;
	const [mainShapeRef, setMainShapeRef] = useState<Konva.Circle | null>(null);
	const [mainTextRef, setMainTextRef] = useState<Konva.Text | null>(null);
	useAnimationGroups(animation, {
		animationFactories: [
			{
				node: mainShapeRef,
				mapper: (a) => ({
					config: a.mainShape,
				}),
			},
			{
				node: mainTextRef,
				mapper: (a) => ({
					config: a.text,
				}),
			},
		],
		onAnimationBegin,
		onAnimationComplete,
		onAnimationDestroy,
		drawerId: id,
	});

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

	const handleDragBoundFunc = function (this: Node, pos: Vector2d) {
		if (!draggableSnap) {
			return pos;
		}

		return dragBoundFuncHandler(this, pos, gridTheme.size);
	};

	return (
		<Group
			visible={visible && Boolean(mainTextRef && mainShapeRef)}
			draggable={draggable}
			dragBoundFunc={handleDragBoundFunc}
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
};

