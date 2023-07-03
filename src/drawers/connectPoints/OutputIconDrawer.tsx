import { Circle } from 'react-konva';
import { ThemeContext, useConnectPointTheme, useSizes } from '../../theme';

export interface OutputIconDrawerProps {
	theme: ThemeContext;
	highlight?: boolean;
}

export const OutputIconDrawer = ({ theme, highlight }: OutputIconDrawerProps) => {
	const connectPointElementTheme = useConnectPointTheme({ highlight }, theme);
	const { connectPointSizes } = useSizes(theme, 1, 0.5);

	return (
		<Circle
			{...connectPointElementTheme.icon}
			listening={false}
			radius={connectPointSizes.radius}
		/>
	);
};

