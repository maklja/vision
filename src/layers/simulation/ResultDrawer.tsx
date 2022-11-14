import Konva from 'konva';
import { forwardRef } from 'react';
import { Circle } from 'react-konva';
import { useDrawerTheme, useSizes } from '../../store/stageSlice';

export interface ResultDrawerProps {
	x?: number;
	y?: number;
	fill?: string;
	stroke?: string;
	visible?: boolean;
}

export const ResultDrawer = forwardRef<Konva.Circle, ResultDrawerProps>((props, ref) => {
	const { simulation } = useDrawerTheme();
	const { simulationSizes } = useSizes();
	return (
		<Circle
			radius={simulationSizes.radius}
			stroke={props.stroke ?? simulation.stroke}
			fill={props.fill ?? simulation.fill}
			ref={ref}
			x={props.x}
			y={props.y}
			visible={props.visible ?? false}
		/>
	);
});

ResultDrawer.displayName = 'ResultDrawer';
