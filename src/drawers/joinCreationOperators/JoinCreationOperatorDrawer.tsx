import { useState } from 'react';
import Konva from 'konva';
import { RegularPolygon, Group, Text } from 'react-konva';
import { DrawerProps } from '../DrawerProps';
import { useElementDrawerTheme, useSizes } from '../../theme';
import { useAnimationGroups } from '../../animation';

export interface JoinCreationOperatorDrawerProps extends DrawerProps {
	title: string;
}

export const JoinCreationOperatorDrawer = ({
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
	onMouseOver,
	onMouseOut,
	onMouseDown,
	onDragMove,
	onDragStart,
	onDragEnd,
	onAnimationDestroy,
	onAnimationBegin,
	onAnimationComplete,
}: JoinCreationOperatorDrawerProps) => {
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

	const textX = drawerSizes.radius - (mainTextRef?.textWidth ?? 0) / 2;
	const textY = drawerSizes.radius - (mainTextRef?.textHeight ?? 0) / 2;

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
			x={x}
			y={y}
			onMouseOver={handleMouseOver}
			onMouseOut={handleMouseOut}
			onMouseDown={handleMouseDown}
			onDragMove={handleDragMove}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<RegularPolygon
				{...drawerStyle.element}
				sides={6}
				ref={(ref) => setMainShapeRef(ref)}
				id={id}
				radius={drawerSizes.radius}
				x={drawerSizes.radius}
				y={drawerSizes.radius}
				rotation={90}
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
	);
};
