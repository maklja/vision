import { Circle } from 'react-konva';
import { ThemeContext, useConnectPointTheme, useSizes } from '../../theme';

export interface InputIconDrawerProps {
	theme: ThemeContext;
	highlight?: boolean;
}

export const InputIconDrawer = ({ theme, highlight }: InputIconDrawerProps) => {
	const connectPointElementTheme = useConnectPointTheme({ highlight }, theme);
	const { connectPointSizes } = useSizes(theme, 1, 0.2);

	return (
		<Circle
			{...connectPointElementTheme.icon}
			listening={false}
			radius={connectPointSizes.radius}
		/>
	);
};

