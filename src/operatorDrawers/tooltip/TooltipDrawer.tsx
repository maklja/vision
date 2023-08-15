import Konva from 'konva';
import { useState } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { Theme, defaultRectangleShape, scaleRectangleShape, useTooltipTheme } from '../../theme';

export interface TooltipDrawerProps {
	id: string;
	theme: Theme;
	x: number;
	y: number;
	text: string;
	scale: number;
	visible?: boolean;
	padding?: number;
}

export const TooltipDrawer = ({
	id,
	theme,
	x,
	y,
	text,
	scale,
	visible = true,
	padding = 8,
}: TooltipDrawerProps) => {
	const rectangleShapeSize = scaleRectangleShape(defaultRectangleShape, scale);
	const tooltipTheme = useTooltipTheme(theme);
	const [textRef, setTextRef] = useState<Konva.Text | null>(null);

	const textWidth = (textRef?.textWidth ?? 0) + padding;
	const textHeight = (textRef?.textHeight ?? 0) + padding;

	return (
		<Group id={id} visible={visible && Boolean(textRef)} x={x} y={y}>
			<Rect
				{...tooltipTheme.element}
				width={textWidth}
				height={textHeight}
				listening={false}
			/>
			<Text
				{...tooltipTheme.text}
				fontSize={rectangleShapeSize.fontSizes.secondary}
				ref={(ref) => setTextRef(ref)}
				text={text}
				padding={padding / 2}
				listening={false}
				align="center"
				verticalAlign="middle"
			/>
		</Group>
	);
};

