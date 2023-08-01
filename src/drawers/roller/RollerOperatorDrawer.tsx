import Konva from 'konva';
import { useState } from 'react';
import { Group, Rect, Text, Ellipse } from 'react-konva';
import { useAnimationGroups } from '../../animation';
import { RectangleDrawerProps } from '../DrawerProps';
import { useElementDrawerTheme } from '../../theme';

export interface RollerOperatorDrawerProps extends RectangleDrawerProps {
	title: string;
}

export const RollerOperatorDrawer = ({
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
	onMouseOver,
	onMouseOut,
	onMouseDown,
	onDragMove,
	onDragStart,
	onDragEnd,
	onAnimationBegin,
	onAnimationComplete,
	onAnimationDestroy,
}: RollerOperatorDrawerProps) => {
	const drawerStyle = useElementDrawerTheme(
		{
			highlight,
			select,
		},
		theme,
	);
	const { width, height, fontSizes } = size;
	const [mainShapeRef, setMainShapeRef] = useState<Konva.Ellipse | null>(null);
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

	const area = width * height * 0.1;
	const radiusY = height / 2;
	const radiusX = area / (Math.PI * radiusY);

	return (
		<Group
			// visible={visible && Boolean(mainTextRef)}
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
			<Ellipse
				{...drawerStyle.element}
				x={radiusX}
				y={radiusY}
				ref={(ref) => setMainShapeRef(ref)}
				id={id}
				radiusX={radiusX}
				radiusY={radiusY}
			/>

			<Ellipse
				{...drawerStyle.element}
				x={width - radiusX}
				y={radiusY}
				ref={(ref) => setMainShapeRef(ref)}
				id={id}
				radiusX={radiusX}
				radiusY={radiusY}
			/>
			<Rect
				fill="transparent"
				stroke="red"
				strokeWidth={1}
				id={id}
				width={width}
				height={height}
			/>
			{/*<Text
				{...drawerStyle.text}
				ref={(ref) => setMainTextRef(ref)}
				text={title}
				x={textX}
				y={textY}
				fontSize={fontSizes.primary}
				listening={false}
			/> */}
		</Group>
	);
};

