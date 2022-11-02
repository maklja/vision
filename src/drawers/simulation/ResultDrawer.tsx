import Konva from 'konva';
import { forwardRef } from 'react';
import { Circle } from 'react-konva';
import { resultSimulationTheme } from '../../theme';

export interface ResultDrawerProps {
	x: number;
	y: number;
}

export const ResultDrawer = forwardRef<Konva.Circle, ResultDrawerProps>((props, ref) => {
	return <Circle {...resultSimulationTheme} ref={ref} x={props.x} y={props.y} />;
});

ResultDrawer.displayName = 'ResultDrawer';

