import { Rect } from 'react-konva';
import { BorderStyle } from '../../theme';
import { DRAWER_DEFAULT, fromSize } from '../utils';

export interface BorderDrawerProps {
	x: number;
	y: number;
	size?: number;
	padding: number;
	style?: BorderStyle;
}

export const BorderDrawer = (props: BorderDrawerProps) => {
	const width = fromSize(DRAWER_DEFAULT.width, props.size) + 2 * props.padding;
	const height = fromSize(DRAWER_DEFAULT.height, props.size) + 2 * props.padding;

	const x = props.x - props.padding;
	const y = props.y - props.padding;

	return <Rect {...props.style} x={x} y={y} width={width} height={height} listening={false} />;
};
