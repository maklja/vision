import { Circle } from 'react-konva';
import { CircleShapeSize, Theme, fromSize, useConnectPointTheme } from '../../theme';
import { ConnectPointPosition } from '../../model';

export interface OutputCircleIconDrawerProps {
	theme: Theme;
	size: CircleShapeSize;
	connectPointPosition: ConnectPointPosition;
	highlight?: boolean;
}

export const OutputCircleIconDrawer = ({
	connectPointPosition,
	theme,
	size,
	highlight,
}: OutputCircleIconDrawerProps) => {
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
};

