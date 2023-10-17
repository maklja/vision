import { useState } from 'react';
import Konva from 'konva';
import { Circle, Group, Text } from 'react-konva';
import { CircleDrawerProps } from '../DrawerProps';
import { useElementDrawerTheme } from '../../theme';
import { useAnimationGroups } from '../../animation';
import { Point } from '../../model';

const snapPositionToGrind = (position: Point, gridSize: number) => {
	const newX1 = position.x + (gridSize - (position.x % gridSize));
	const newX2 = position.x - (position.x % gridSize);

	const newY1 = position.y + (gridSize - (position.y % gridSize));
	const newY2 = position.y - (position.y % gridSize);

	return {
		x: Math.abs(newX1 - position.x) < Math.abs(newX2 - position.x) ? newX1 : newX2,
		y: Math.abs(newY1 - position.y) < Math.abs(newY2 - position.y) ? newY1 : newY2,
	};
};

export interface CircleOperatorDrawerProps extends CircleDrawerProps {
	title: string;
}

export const CircleOperatorDrawer = ({
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
	onDragMove,
	onDragStart,
	onDragEnd,
	onAnimationDestroy,
	onAnimationBegin,
	onAnimationComplete,
}: CircleOperatorDrawerProps) => {
	const drawerStyle = useElementDrawerTheme(
		{
			highlight,
			select,
			hasError,
		},
		theme,
	);
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
			dragBoundFunc={function (pos) {
				// console.log(pos, this.getAbsolutePosition(), x, y);
				return snapPositionToGrind(pos, 25.5);
			}}
			x={x}
			y={y}
			onMouseOver={handleMouseOver}
			onMouseOut={handleMouseOut}
			onMouseDown={handleMouseDown}
			onDragMove={handleDragMove}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<Circle
				{...drawerStyle.element.primary}
				ref={(ref) => setMainShapeRef(ref)}
				id={id}
				radius={radius}
				x={radius}
				y={radius}
				draggable={false}
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
				draggable={false}
			/>
		</Group>
	);
};
