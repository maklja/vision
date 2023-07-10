import { Path } from 'react-konva';
import { ThemeContext, useConnectPointTheme, useSizes } from '../../theme';
import { ConnectPointPosition } from '../../model';

export interface CheckIconDrawerProps {
	theme: ThemeContext;
	connectPointPosition: ConnectPointPosition;
	highlight?: boolean;
}

const ICON_SCALE_CORRECTION = 1.6;

export const CheckIconDrawer = ({
	connectPointPosition,
	theme,
	highlight,
}: CheckIconDrawerProps) => {
	const connectPointElementTheme = useConnectPointTheme(
		{ position: connectPointPosition, highlight },
		theme,
	);
	const { connectPointSizes } = useSizes(theme);
	const scaleFactor = (connectPointSizes.radius / 16) * ICON_SCALE_CORRECTION;
	return (
		<Path
			{...connectPointElementTheme.icon}
			listening={false}
			x={(-connectPointSizes.radius / 2) * ICON_SCALE_CORRECTION}
			y={(-connectPointSizes.radius / 2) * ICON_SCALE_CORRECTION}
			scale={{ x: scaleFactor, y: scaleFactor }}
			data="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"
		/>
	);
};

