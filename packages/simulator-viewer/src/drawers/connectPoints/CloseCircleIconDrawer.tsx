import { Path } from 'react-konva';
import { ConnectPointPosition } from '@maklja/vision-simulator-model';
import { CircleShapeSize, Theme, useConnectPointTheme } from '../../theme';

export interface CloseCircleIconDrawerProps {
	theme: Theme;
	size: CircleShapeSize;
	connectPointPosition: ConnectPointPosition;
	highlight?: boolean;
}

const ICON_SCALE_CORRECTION = 1.8;

export function CloseCircleIconDrawer({
	connectPointPosition,
	theme,
	size,
	highlight,
}: CloseCircleIconDrawerProps) {
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
			data="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
		/>
	);
}

