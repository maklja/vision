import { Rect } from 'react-konva';
import { Theme } from '../../theme';

export interface LassoSelectionProps {
	x: number;
	y: number;
	width: number;
	height: number;
	theme: Theme;
}

export function LassoSelection({ x, y, width, height, theme }: LassoSelectionProps) {
	return (
		<Rect
			x={x}
			y={y}
			width={width}
			height={height}
			stroke={theme.lasso.stroke}
			fill={theme.lasso.fill}
			strokeWidth={theme.lasso.strokeWidth}
			cornerRadius={theme.lasso.cornerRadius}
		/>
	);
}

