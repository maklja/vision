import { Path } from 'react-konva';
import { ThemeContext, useConnectPointTheme, useSizes } from '../../theme';

export interface EventIconDrawerProps {
	theme: ThemeContext;
	highlight?: boolean;
}

export const EventIconDrawer = ({ theme, highlight }: EventIconDrawerProps) => {
	const connectPointElementTheme = useConnectPointTheme({ highlight }, theme);
	const { connectPointSizes } = useSizes(theme);
	const scaleFactor = connectPointSizes.radius / 16;
	return (
		<Path
			{...connectPointElementTheme.icon}
			listening={false}
			x={-connectPointSizes.radius / 2}
			y={-connectPointSizes.radius / 2}
			scale={{ x: 1.2 * scaleFactor, y: 1.2 * scaleFactor }}
			data="M5.52.359A.5.5 0 0 1 6 0h4a.5.5 0 0 1 .474.658L8.694 6H12.5a.5.5 0 0 1 .395.807l-7 9a.5.5 0 0 1-.873-.454L6.823 9.5H3.5a.5.5 0 0 1-.48-.641l2.5-8.5z"
		/>
	);
};

