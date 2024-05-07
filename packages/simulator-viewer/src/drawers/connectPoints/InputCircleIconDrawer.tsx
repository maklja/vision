import { Circle } from 'react-konva';
import { ConnectPointPosition } from '@maklja/vision-simulator-model';
import { CircleShapeSize, Theme, fromSize, useConnectPointTheme } from '../../theme';

export interface InputCircleIconDrawerProps {
	theme: Theme;
	size: CircleShapeSize;
	connectPointPosition: ConnectPointPosition;
	highlight?: boolean;
}

export function InputCircleIconDrawer({
	theme,
	size,
	highlight,
	connectPointPosition,
}: InputCircleIconDrawerProps) {
	const connectPointElementTheme = useConnectPointTheme(theme, {
		highlight,
		position: connectPointPosition,
	});
	const radius = fromSize(size.radius, 0.2);

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

