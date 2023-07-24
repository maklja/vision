import { Path } from 'react-konva';
import { CircleShapeSize, Theme, useConnectPointTheme } from '../../theme';
import { ConnectPointPosition } from '../../model';

export interface EventCircleIconDrawerProps {
	theme: Theme;
	connectPointPosition: ConnectPointPosition;
	size: CircleShapeSize;
	highlight?: boolean;
}

const ICON_SCALE_CORRECTION = 1.2;
export const EventCircleIconDrawer = ({
	theme,
	size,
	connectPointPosition,
	highlight,
}: EventCircleIconDrawerProps) => {
	const connectPointElementTheme = useConnectPointTheme(
		{ position: connectPointPosition, highlight },
		theme,
	);
	const scaleFactor = (size.radius / 16) * ICON_SCALE_CORRECTION;
	return (
		<Path
			{...connectPointElementTheme.icon}
			listening={false}
			x={(-size.radius / 2) * ICON_SCALE_CORRECTION}
			y={(-size.radius / 2) * ICON_SCALE_CORRECTION}
			scale={{ x: scaleFactor, y: scaleFactor }}
			data="M5.52.359A.5.5 0 0 1 6 0h4a.5.5 0 0 1 .474.658L8.694 6H12.5a.5.5 0 0 1 .395.807l-7 9a.5.5 0 0 1-.873-.454L6.823 9.5H3.5a.5.5 0 0 1-.48-.641l2.5-8.5z"
		/>
	);
};