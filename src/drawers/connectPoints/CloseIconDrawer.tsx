import { Path } from 'react-konva';
import { ThemeContext, useConnectPointTheme, useSizes } from '../../theme';
import { ConnectPointPosition } from '../../model';

export interface CloseIconDrawerProps {
	theme: ThemeContext;
	connectPointPosition: ConnectPointPosition;
	highlight?: boolean;
}

const ICON_SCALE_CORRECTION = 1.8;

export const CloseIconDrawer = ({
	connectPointPosition,
	theme,
	highlight,
}: CloseIconDrawerProps) => {
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
			data="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
		/>
	);
};

