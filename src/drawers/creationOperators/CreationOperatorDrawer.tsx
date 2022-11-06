import { useEffect, useState } from 'react';
import Konva from 'konva';
import { Circle, Group, Text } from 'react-konva';
import { fromSize, DRAWER_DEFAULT } from '../utils';
import {
	elementTextTheme,
	elementTheme,
	highlightElementAnimation,
	highlightTextAnimation,
} from '../../theme';
import { DrawerAnimations, DrawerProps } from '../DrawerProps';
import { Animation, useAnimation, useAnimationGroups } from '../../animation';

export interface CreationOperatorDrawerProps extends DrawerProps {
	title: string;
}

export const CreationOperatorDrawer = (props: CreationOperatorDrawerProps) => {
	const [mainShapeRef, setMainShapeRef] = useState<Konva.Circle | null>(null);
	const [mainTextRef, setMainTextRef] = useState<Konva.Text | null>(null);

	const mainShapeHighlightAnimation = useAnimation(mainShapeRef, highlightElementAnimation);
	const mainTextHighlightAnimation = useAnimation(mainTextRef, highlightTextAnimation);
	const highlightAnimation = useAnimationGroups(
		mainShapeHighlightAnimation,
		mainTextHighlightAnimation,
	);

	const {
		x,
		y,
		title,
		size,
		id,
		onMouseOver,
		onMouseOut,
		onMouseDown,
		onDragMove,
		onDragStart,
		onDragEnd,
	} = props;
	const radius = fromSize(DRAWER_DEFAULT.radius, size);
	const textFontSize = fromSize(DRAWER_DEFAULT.textFontSize, size);
	// const iconFontSize = fromSize(DRAWER_DEFAULT.iconFontSize, size);
	// const iconX = radius + -1 * radius * Math.sin(-45) - (iconTextRef?.textWidth ?? 0) / 2;
	// const iconY = radius + radius * Math.cos(-45) - (iconTextRef?.textHeight ?? 0) / 2;

	const textX = radius + (mainTextRef?.textWidth ?? 0) / -2;
	const textY = radius + (mainTextRef?.textHeight ?? 0) / -2;

	const handleMouseOver = (e: Konva.KonvaEventObject<MouseEvent>) => onMouseOver?.(id, e);

	const handleMouseOut = (e: Konva.KonvaEventObject<MouseEvent>) => onMouseOut?.(id, e);

	const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => onMouseDown?.(id, e);

	const handleDragMove = (e: Konva.KonvaEventObject<MouseEvent>) => onDragMove?.(id, e);

	const handleDragStart = (e: Konva.KonvaEventObject<MouseEvent>) => onDragStart?.(id, e);

	const handleDragEnd = (e: Konva.KonvaEventObject<MouseEvent>) => onDragEnd?.(id, e);

	useEffect(() => {
		if (!highlightAnimation) {
			return;
		}

		const animations: DrawerAnimations = {
			highlight: highlightAnimation,
		};
		props.onAnimationReady?.(props.id, animations);

		return () => {
			Object.values(animations).forEach((a: Animation) => a.destroy());
			props.onAnimationDestroy?.(props.id);
		};
	}, [highlightAnimation]);

	return (
		<Group
			x={x}
			y={y}
			draggable
			visible={Boolean(mainTextRef && mainShapeRef)}
			onMouseOver={handleMouseOver}
			onMouseOut={handleMouseOut}
			onMouseDown={handleMouseDown}
			onDragMove={handleDragMove}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<Circle
				{...elementTheme}
				ref={(ref) => setMainShapeRef(ref)}
				id={id}
				radius={radius}
				x={radius}
				y={radius}
			/>
			<Text
				{...elementTextTheme}
				ref={(ref) => setMainTextRef(ref)}
				text={title}
				x={textX}
				y={textY}
				fontSize={textFontSize}
				listening={false}
			/>
		</Group>
	);
};
