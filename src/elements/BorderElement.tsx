import { Rect } from 'react-konva';
import { selectedBorderTheme, highlightBorderTheme } from '../theme';

export interface BorderElementProps {
	x: number;
	y: number;
	width: number;
	height: number;
	padding: number;
	selected?: boolean;
	highlighted?: boolean;
}

export const BorderElement = (props: BorderElementProps) => {
	if (!props.selected || !props.highlighted) {
		return null;
	}

	const x = props.x - props.padding;
	const y = props.y - props.padding;
	const width = props.width + 2 * props.padding;
	const height = props.height + 2 * props.padding;

	const theme = props.selected
		? selectedBorderTheme
		: props.highlighted
		? highlightBorderTheme
		: {};

	return <Rect x={x} y={y} width={width} height={height} listening={false} {...theme} />;
};

