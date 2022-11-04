import { useEffect, useState } from 'react';
import Konva from 'konva';
import { Circle, Group, Text, Label, Tag } from 'react-konva';
import { fromSize, DRAWER_DEFAULT } from '../utils';
import {
	AnimationControl,
	elementIconTheme,
	elementTextTheme,
	elementTheme,
	highlightElementAnimation,
} from '../../theme';
import { DrawerProps } from '../DrawerProps';

export interface CreateOperatorDrawerAnimations {
	highlight: AnimationControl;
}

export interface CreationOperatorDrawerProps extends DrawerProps {
	title: string;
	icon: string;
	onAnimationReady?: (id: string, animations: CreateOperatorDrawerAnimations) => void;
	onAnimationDestroy?: (id: string) => void;
}

export const CreationOperatorDrawer = (props: CreationOperatorDrawerProps) => {
	const [mainShape, setMainShape] = useState<Konva.Circle | null>(null);
	const [textRef, setTextRef] = useState<Konva.Text | null>(null);
	const [iconTextRef, setIconTextRef] = useState<Konva.Text | null>(null);

	const {
		x,
		y,
		title,
		icon,
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
	const iconFontSize = fromSize(DRAWER_DEFAULT.iconFontSize, size);

	const textX = radius + (textRef?.textWidth ?? 0) / -2;
	const textY = radius + (textRef?.textHeight ?? 0) / -2;
	const iconX = radius + -1 * radius * Math.sin(-45) - (iconTextRef?.textWidth ?? 0) / 2;
	const iconY = radius + radius * Math.cos(-45) - (iconTextRef?.textHeight ?? 0) / 2;

	const handleMouseOver = (e: Konva.KonvaEventObject<MouseEvent>) => onMouseOver?.(id, e);

	const handleMouseOut = (e: Konva.KonvaEventObject<MouseEvent>) => onMouseOut?.(id, e);

	const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => onMouseDown?.(id, e);

	const handleDragMove = (e: Konva.KonvaEventObject<MouseEvent>) => onDragMove?.(id, e);

	const handleDragStart = (e: Konva.KonvaEventObject<MouseEvent>) => onDragStart?.(id, e);

	const handleDragEnd = (e: Konva.KonvaEventObject<MouseEvent>) => onDragEnd?.(id, e);

	useEffect(() => {
		if (!textRef || !iconTextRef || !mainShape) {
			return;
		}

		props.onAnimationReady?.(props.id, { highlight: highlightElementAnimation(mainShape) });
	}, [textRef, iconTextRef, mainShape]);

	return (
		<Group
			x={x}
			y={y}
			draggable
			visible={Boolean(textRef && iconTextRef && mainShape)}
			onMouseOver={handleMouseOver}
			onMouseOut={handleMouseOut}
			onMouseDown={handleMouseDown}
			onDragMove={handleDragMove}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<Circle
				{...elementTheme}
				ref={(ref) => setMainShape(ref)}
				id={id}
				radius={radius}
				x={radius}
				y={radius}
			/>
			<Label x={iconX} y={iconY} listening={false}>
				<Tag fill="#eee" />
				<Text
					{...elementIconTheme}
					ref={(ref) => setIconTextRef(ref)}
					text={icon}
					fontSize={iconFontSize}
				/>
			</Label>
			<Text
				{...elementTextTheme}
				ref={(ref) => setTextRef(ref)}
				text={title}
				x={textX}
				y={textY}
				fontSize={textFontSize}
				listening={false}
			/>
		</Group>
	);
};

