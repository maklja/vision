import { Circle } from 'react-konva';
import { ConnectPointPosition } from '@maklja/vision-simulator-model';
import { CircleShapeSize, Theme, fromSize, useConnectPointTheme } from '../../theme';

export interface OutputCircleIconDrawerProps {
	theme: Theme;
	size: CircleShapeSize;
	connectPointPosition: ConnectPointPosition;
	highlight?: boolean;
}

export function OutputCircleIconDrawer({
	connectPointPosition,
	theme,
	size,
	highlight,
}: OutputCircleIconDrawerProps) {
	const connectPointElementTheme = useConnectPointTheme(theme, {
		position: connectPointPosition,
		highlight,
	});

	const radius = fromSize(size.radius, 0.5);
	return (
		<Circle
			{...connectPointElementTheme.icon}
			listening={false}
			x={size.radius}
			y={size.radius}
			radius={radius}
		/>
	);
}

