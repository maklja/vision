import Konva from 'konva';
import { useState } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { Theme, defaultRectangleShape, scaleRectangleShape, useTooltipTheme } from '../../theme';

export interface TooltipDrawerProps {
	id: string;
	theme: Theme;
	x: number;
	y: number;
	width: number;
	text: string;
	scale: number;
	visible?: boolean;
	padding?: number;
	offset?: number;
}

export const TooltipDrawer = ({
	id,
	theme,
	x,
	y,
	width,
	text,
	scale,
	visible = true,
	padding = 8,
	offset = 6,
}: TooltipDrawerProps) => {
	const rectangleShapeSize = scaleRectangleShape(defaultRectangleShape, scale);
	const tooltipTheme = useTooltipTheme(theme);
	const [textRef, setTextRef] = useState<Konva.Text | null>(null);

	const textWidth = textRef?.width() ?? 0;
	const textHeight = textRef?.height() ?? 0;

	return (
		<Group id={id} visible={visible && Boolean(textRef)} x={x} y={y}>
			<Rect
				{...tooltipTheme.element}
				x={-textWidth / 2}
				y={-textHeight - offset}
				width={textWidth}
				height={textHeight}
				listening={false}
			/>
			<Text
				{...tooltipTheme.text}
				x={-textWidth / 2}
				y={-textHeight - offset}
				fontSize={rectangleShapeSize.fontSizes.secondary}
				ref={(ref) => setTextRef(ref)}
				text={text}
				padding={padding / 2}
				listening={false}
				align="center"
				verticalAlign="middle"
				wrap="word"
				width={width}
			/>
		</Group>
	);
};

