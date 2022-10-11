import { Rect } from 'react-konva';
import { ElementState } from './ElementState';
import { borderThemeByElementState } from '../theme';

export interface BorderElementProps {
	x: number;
	y: number;
	width: number;
	height: number;
	padding: number;
	state?: ElementState;
}

export const BorderElement = (props: BorderElementProps) => {
	if (!props.state) {
		return null;
	}

	const x = props.x - props.padding;
	const y = props.y - props.padding;
	const width = props.width + 2 * props.padding;
	const height = props.height + 2 * props.padding;

	return (
		<Rect
			x={x}
			y={y}
			width={width}
			height={height}
			listening={false}
			{...borderThemeByElementState(props.state)}
		/>
	);
};

