import { Path } from 'react-konva';
import { ConnectPointPosition } from '@maklja/vision-simulator-model';
import { CircleShapeSize, Theme, useConnectPointTheme } from '../../theme';

export interface CheckCircleIconDrawerProps {
	theme: Theme;
	size: CircleShapeSize;
	connectPointPosition: ConnectPointPosition;
	highlight?: boolean;
}

const ICON_SCALE_CORRECTION = 1.75;

export function CheckCircleIconDrawer({
	connectPointPosition,
	theme,
	size,
	highlight,
}: CheckCircleIconDrawerProps) {
	const connectPointElementTheme = useConnectPointTheme(theme, {
		position: connectPointPosition,
		highlight,
	});
	const scaleFactor = (size.radius / 16) * ICON_SCALE_CORRECTION;

	return (
		<Path
			{...connectPointElementTheme.icon}
			listening={false}
			x={scaleFactor}
			y={scaleFactor}
			scale={{ x: scaleFactor, y: scaleFactor }}
			data="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"
		/>
	);
}

