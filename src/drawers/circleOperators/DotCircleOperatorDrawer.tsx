import Konva from 'konva';
import { Circle, Group } from 'react-konva';
import { CircleDrawerProps } from '../DrawerProps';
import { useState } from 'react';
import { useAnimationGroups } from '../../animation';
import { useCircleSizeScale, useElementDrawerTheme } from '../../theme';

export const DotCircleOperatorDrawer = ({
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
	onMouseDown,
	onMouseOut,
	onMouseOver,
	onDragMove,
	onDragStart,
	onDragEnd,
	onAnimationBegin,
	onAnimationComplete,
	onAnimationDestroy,
}: CircleDrawerProps) => {
	const { colors } = theme;
	const drawerStyle = useElementDrawerTheme(
		{
			highlight,
			select,
		},
		theme,
	);
	const [mainShapeRef, setMainShapeRef] = useState<Konva.Circle | null>(null);
	const [innerShapeRef, setInnerShapeRef] = useState<Konva.Circle | null>(null);
	useAnimationGroups(animation, {
		animationFactories: [
			{
				node: mainShapeRef,
				mapper: (a) => ({
					config: a.mainShape,
				}),
			},
			{
				node: innerShapeRef,
				mapper: (a) => ({
					config: a.secondaryShape,
				}),
			},
		],
		onAnimationBegin,
		onAnimationComplete,
		onAnimationDestroy,
		drawerId: id,
	});

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
			onMouseDown={handleMouseDown}
			onMouseOver={handleMouseOver}
			onMouseOut={handleMouseOut}
			onDragMove={handleDragMove}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<Circle
				{...drawerStyle.element}
				ref={(node) => setMainShapeRef(node)}
				id={id}
				radius={size.radius}
				x={size.radius}
				y={size.radius}
			/>
			<Circle
				ref={(node) => setInnerShapeRef(node)}
				radius={innerSizes.radius}
				x={size.radius}
				y={size.radius}
				listening={false}
				fill={highlight || select ? colors.primaryColor : colors.secondaryColor}
			/>
		</Group>
	);
};