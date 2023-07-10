import { Circle } from 'react-konva';
import { Theme, useConnectPointTheme, useSizes } from '../../theme';
import { ConnectPointPosition } from '../../model';

export interface OutputIconDrawerProps {
	theme: Theme;
	connectPointPosition: ConnectPointPosition;
	highlight?: boolean;
}

export const OutputIconDrawer = ({
	connectPointPosition,
	theme,
	highlight,
}: OutputIconDrawerProps) => {
	const connectPointElementTheme = useConnectPointTheme(
		{ position: connectPointPosition, highlight },
		theme,
	);
	const { connectPointSizes } = useSizes(theme, 1, 0.5);

	return (
		<Circle
			{...connectPointElementTheme.icon}
			listening={false}
			radius={connectPointSizes.radius}
		/>
	);
};

