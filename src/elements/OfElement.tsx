import { useState } from 'react';
import Konva from 'konva';
import { Circle, Group, Text, Label, Tag } from 'react-konva';
import { fromSize, DRAWER_DEFAULT } from './utils';
import { BorderElement } from './BorderElement';
import { elementTheme } from '../theme';
import { ElementProps, elementConnector } from '../store/connector';
import { RectConnectionPoints } from './ConnectionPoints';
import { ElementState } from './ElementState';

export const OfElement = (props: ElementProps) => {
	const [textRef, setTextRef] = useState<Konva.Text | null>(null);
	const [iconTextRef, setIconTextRef] = useState<Konva.Text | null>(null);

	const {
		x = 0,
		y = 0,
		size,
		id,
		state,
		onMouseOver,
		onMouseOut,
		onMouseDown,
		onMouseDrag,
	} = props;
	const radius = fromSize(DRAWER_DEFAULT.radius, size);
	const textFontSize = fromSize(DRAWER_DEFAULT.textFontSize, size);
	const iconFontSize = fromSize(DRAWER_DEFAULT.iconFontSize, size);

	const textX = (textRef?.textWidth ?? 0) / -2;
	const textY = (textRef?.textHeight ?? 0) / -2;
	const iconX = -1 * radius * Math.sin(-45) - (iconTextRef?.textWidth ?? 0) / 2;
	const iconY = radius * Math.cos(-45) - (iconTextRef?.textHeight ?? 0) / 2;

	const handleMouseOver = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onMouseOver && onMouseOver(id, e);

	const handleMouseOut = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onMouseOut && onMouseOut(id, e);

	const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onMouseDown && onMouseDown(id, e);

	const handleDragMove = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onMouseDrag && onMouseDrag(id, e);

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
		>
			<BorderElement
				x={radius * -1}
				y={radius * -1}
				width={radius * 2}
				height={radius * 2}
				padding={3}
				state={props.state}
			/>
			<RectConnectionPoints
				id={id}
				x={radius * -1}
				y={radius * -1}
				width={radius * 2}
				height={radius * 2}
				selected={state === ElementState.Selected}
			/>
			<Circle {...elementTheme} id={id} radius={radius} />
			<Label x={iconX} y={iconY} listening={false}>
				<Tag fill="white" />
				<Text
					ref={(ref) => setIconTextRef(ref)}
					text="{ }"
					fontSize={iconFontSize}
					{...elementTheme}
				/>
			</Label>
			<Text
				ref={(ref) => setTextRef(ref)}
				text="of"
				x={textX}
				y={textY}
				fontSize={textFontSize}
				listening={false}
				{...elementTheme}
			/>
		</Group>
	);
};

export const ConnectedOfElement = elementConnector(OfElement);

