import Konva from 'konva';
import { forwardRef } from 'react';
import { Circle } from 'react-konva';
import { ThemeContext, useSizes } from '../../theme';

export interface ResultDrawerProps {
	theme: ThemeContext;
	x?: number;
	y?: number;
	fill?: string;
	stroke?: string;
	visible?: boolean;
}

export const ResultDrawer = forwardRef<Konva.Circle, ResultDrawerProps>(
	({ theme, fill, stroke, visible, x, y }, ref) => {
		const { simulation } = theme;
		const { simulationSizes } = useSizes(theme);
		return (
			<Circle
				radius={simulationSizes.radius}
				stroke={stroke ?? simulation.stroke}
				fill={fill ?? simulation.fill}
				ref={ref}
				x={x}
				y={y}
				visible={visible ?? false}
			/>
		);
	},
);

ResultDrawer.displayName = 'ResultDrawer';

