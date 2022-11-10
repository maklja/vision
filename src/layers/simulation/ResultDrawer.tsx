import Konva from 'konva';
import { forwardRef } from 'react';
import { Circle } from 'react-konva';
import { resultSimulationTheme } from '../../theme';

export interface ResultDrawerProps {
	x?: number;
	y?: number;
	fill?: string;
	stroke?: string;
	visible?: boolean;
}

export const ResultDrawer = forwardRef<Konva.Circle, ResultDrawerProps>((props, ref) => {
	return (
		<Circle
			{...resultSimulationTheme}
			stroke={props.stroke}
			fill={props.fill}
			ref={ref}
			x={props.x}
			y={props.y}
			visible={props.visible ?? false}
		/>
	);
});

ResultDrawer.displayName = 'ResultDrawer';

