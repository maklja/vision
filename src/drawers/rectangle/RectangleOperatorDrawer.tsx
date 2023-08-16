import Konva from 'konva';
import { useState } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { useAnimationGroups } from '../../animation';
import { RectangleDrawerProps } from '../DrawerProps';
import { useElementDrawerTheme } from '../../theme';

export interface RectangleOperatorDrawerProps extends RectangleDrawerProps {
	title: string;
}

export const RectangleOperatorDrawer = ({
	x,
	y,
	size,
	id,
	theme,
	highlight,
	select,
	visible = true,
	title,
	animation,
	draggable = false,
	hasError = false,
	onMouseOver,
	onMouseOut,
	onMouseDown,
	onDragMove,
	onDragStart,
	onDragEnd,
	onAnimationBegin,
	onAnimationComplete,
	onAnimationDestroy,
}: RectangleOperatorDrawerProps) => {
	const drawerStyle = useElementDrawerTheme(
		{
			highlight,
			select,
			hasError,
		},
		theme,
	);
	const { width, height, fontSizes } = size;
	const [mainShapeRef, setMainShapeRef] = useState<Konva.Rect | null>(null);
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

	const textX = (mainTextRef?.textWidth ?? 0) / -2 + width / 2;
	const textY = (mainTextRef?.textHeight ?? 0) / -2 + height / 2;

	return (
		<Group
			visible={visible && Boolean(mainTextRef)}
			x={x}
			y={y}
			draggable={draggable}
			onMouseOver={handleMouseOver}
			onMouseOut={handleMouseOut}
			onMouseDown={handleMouseDown}
			onDragMove={handleDragMove}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<Rect
				{...drawerStyle.element.primary}
				ref={(ref) => setMainShapeRef(ref)}
				id={id}
				width={width}
				height={height}
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
