import { useState } from 'react';
import Konva from 'konva';
import { Circle, Group, Text, Label, Tag } from 'react-konva';
import { fromSize, DRAWER_DEFAULT } from '../utils';
import { BorderElement } from '../BorderElement';
import { elementTheme } from '../../theme';
import { ConnectedConnectPoints } from '../ConnectedConnectPoints';
import { ElementProps } from '../ElementProps';

export interface CreationOperatorDrawerProps extends ElementProps {
	title: string;
	icon: string;
}

export const CreationOperatorDrawer = (props: CreationOperatorDrawerProps) => {
	const [textRef, setTextRef] = useState<Konva.Text | null>(null);
	const [iconTextRef, setIconTextRef] = useState<Konva.Text | null>(null);

	const {
		x = 0,
		y = 0,
		title,
		icon,
		size,
		id,
		selected,
		highlighted,
		dragging,
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

	const textX = (textRef?.textWidth ?? 0) / -2;
	const textY = (textRef?.textHeight ?? 0) / -2;
	const iconX = -1 * radius * Math.sin(-45) - (iconTextRef?.textWidth ?? 0) / 2;
	const iconY = radius * Math.cos(-45) - (iconTextRef?.textHeight ?? 0) / 2;

	const handleMouseOver = (e: Konva.KonvaEventObject<MouseEvent>) => onMouseOver?.(id, e);

	const handleMouseOut = (e: Konva.KonvaEventObject<MouseEvent>) => onMouseOut?.(id, e);

	const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => onMouseDown?.(id, e);

	const handleDragMove = (e: Konva.KonvaEventObject<MouseEvent>) => onDragMove?.(id, e);

	const handleDragStart = (e: Konva.KonvaEventObject<MouseEvent>) => onDragStart?.(id, e);

	const handleDragEnd = (e: Konva.KonvaEventObject<MouseEvent>) => onDragEnd?.(id, e);

	return (
		<Group
			x={x}
			y={y}
			draggable
			visible={Boolean(textRef)}
			onMouseOver={handleMouseOver}
			onMouseOut={handleMouseOut}
			onMouseDown={handleMouseDown}
			onDragMove={handleDragMove}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<BorderElement
				x={radius * -1}
				y={radius * -1}
				width={radius * 2}
				height={radius * 2}
				padding={3}
				selected={selected}
				highlighted={highlighted}
			/>
			<ConnectedConnectPoints
				id={id}
				absoluteX={x}
				absoluteY={y}
				x={radius * -1}
				y={radius * -1}
				width={radius * 2}
				height={radius * 2}
				selected={selected}
				dragging={dragging}
			/>
			<Circle {...elementTheme} id={id} radius={radius} />
			<Label x={iconX} y={iconY} listening={false}>
				<Tag fill="#eee" />
				<Text
					ref={(ref) => setIconTextRef(ref)}
					text={icon}
					fontSize={iconFontSize}
					{...elementTheme}
				/>
			</Label>
			<Text
				ref={(ref) => setTextRef(ref)}
				text={title}
				x={textX}
				y={textY}
				fontSize={textFontSize}
				listening={false}
				{...elementTheme}
			/>
		</Group>
	);
};

