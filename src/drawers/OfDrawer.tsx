import { useState } from 'react';
import Konva from 'konva';
import { Circle, Group, Text, Label, Tag, Rect } from 'react-konva';
import { StateEvent, useStageState } from '../state';
import { fromSize, DRAWER_DEFAULT } from './utils';

export interface OfDrawerProps {
	id: string;
	x: number;
	y: number;
	size: number;
	selected?: boolean;
}

export const OfDrawer = (props: OfDrawerProps) => {
	const { theme } = useStageState();
	const [stateEvent, setStateEvent] = useState<StateEvent>(StateEvent.Default);
	const [textRef, setTextRef] = useState<Konva.Text | null>(null);
	const [iconTextRef, setIconTextRef] = useState<Konva.Text | null>(null);

	const { x, y, size, id } = props;
	const radius = fromSize(DRAWER_DEFAULT.radius, size);
	const textFontSize = fromSize(DRAWER_DEFAULT.textFontSize, size);
	const iconFontSize = fromSize(DRAWER_DEFAULT.iconFontSize, size);

	const textX = (textRef?.textWidth ?? 0) / 2;
	const textY = (textRef?.textHeight ?? 0) / 2;
	const iconX = x - radius * Math.sin(-45) - (iconTextRef?.textWidth ?? 0) / 2;
	const iconY = y + radius * Math.cos(-45) - (iconTextRef?.textHeight ?? 0) / 2;

	const handleMouseOver = () => {
		setStateEvent(StateEvent.Hover);
	};

	const handleMouseLeave = () => {
		setStateEvent(StateEvent.Default);
	};

	return (
		<Group
			draggable
			visible={Boolean(textRef)}
			onMouseOver={handleMouseOver}
			onMouseLeave={handleMouseLeave}
		>
			<Circle {...theme[stateEvent]} id={id} x={x} y={y} radius={radius} fill="transparent" />
			<Label x={iconX} y={iconY} listening={false}>
				<Tag fill="white" />
				<Text
					ref={(ref) => setIconTextRef(ref)}
					text="{ }"
					fontSize={iconFontSize}
					{...theme[stateEvent]}
				/>
			</Label>
			<Text
				ref={(ref) => setTextRef(ref)}
				text="of"
				x={x - textX}
				y={y - textY}
				fontSize={textFontSize}
				listening={false}
				{...theme[stateEvent]}
			/>
			<Rect
				x={x - radius - 5}
				y={y - radius - 5}
				width={radius * 2 + 10}
				height={radius * 2 + 10}
				stroke="skyblue"
				strokeWidth={1}
				cornerRadius={8}
			/>
		</Group>
	);
};
