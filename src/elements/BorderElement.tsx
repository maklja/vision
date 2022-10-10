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

	return (
		<Rect
			x={props.x - props.padding}
			y={props.y - props.padding}
			width={props.width + 2 * props.padding}
			height={props.height + 2 * props.padding}
			listening={false}
			{...borderThemeByElementState(props.state)}
		/>
	);
};
