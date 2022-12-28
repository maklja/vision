import { useState } from 'react';
import Konva from 'konva';
import { Circle, Group, Text } from 'react-konva';
import { DrawerProps } from '../DrawerProps';
import { useElementDrawerTheme, useSizes } from '../../theme';
import { useAnimationEffect, useAnimationGroups } from '../../animation';

export interface CreationOperatorDrawerProps extends DrawerProps {
	title: string;
}

export const CreationOperatorDrawer = ({
	x,
	y,
	title,
	size,
	highlight,
	select,
	id,
	theme,
	animation,
	onMouseOver,
	onMouseOut,
	onMouseDown,
	onDragMove,
	onDragStart,
	onDragEnd,
	onAnimationDestroy,
	onAnimationBegin,
	onAnimationComplete,
}: CreationOperatorDrawerProps) => {
	const drawerStyle = useElementDrawerTheme(
		{
			highlight,
			select,
		},
		theme,
	);
	const { drawerSizes, fontSizes } = useSizes(theme, size);
	const [mainShapeRef, setMainShapeRef] = useState<Konva.Circle | null>(null);
	const [mainTextRef, setMainTextRef] = useState<Konva.Text | null>(null);
	const drawerAnimation = useAnimationGroups(animation, [
		{
			node: mainShapeRef,
			mapper: (a) => ({
				config: a.mainShape,
				options: a.options,
			}),
		},
		{
			node: mainTextRef,
			mapper: (a) => ({
				config: a.text,
				options: a.options,
			}),
		},
	]);
	
	const textX = drawerSizes.radius + (mainTextRef?.textWidth ?? 0) / -2;
	const textY = drawerSizes.radius + (mainTextRef?.textHeight ?? 0) / -2;

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

	useAnimationEffect(drawerAnimation, {
		onAnimationBegin,
		onAnimationComplete,
		onAnimationDestroy,
		drawerId: id,
		simulationId: animation?.simulationId,
	});

	return (
		<Group visible={Boolean(mainTextRef && mainShapeRef)}>
			<Group
				draggable
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
					{...drawerStyle.element}
					ref={(ref) => setMainShapeRef(ref)}
					id={id}
					radius={drawerSizes.radius}
					x={drawerSizes.radius}
					y={drawerSizes.radius}
				/>
				<Text
					{...drawerStyle.text}
					ref={(ref) => setMainTextRef(ref)}
					text={title}
					x={textX}
					y={textY}
					fontSize={fontSizes.primary}
					listening={false}
				/>
			</Group>
		</Group>
	);
};
