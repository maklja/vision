import { Rect } from 'react-konva';
import { BorderStyle } from '../../theme';

export interface BorderDrawerProps {
	x: number;
	y: number;
	width: number;
	height: number;
	padding: number;
	style?: BorderStyle;
}

export const BorderDrawer = (props: BorderDrawerProps) => {
	const x = props.x - props.padding;
	const y = props.y - props.padding;
	const width = props.width + 2 * props.padding;
	const height = props.height + 2 * props.padding;

	return <Rect {...props.style} x={x} y={y} width={width} height={height} listening={false} />;
};
