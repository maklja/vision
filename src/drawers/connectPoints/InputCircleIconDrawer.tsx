import { Circle } from 'react-konva';
import { CircleShapeSize, Theme, fromSize, useConnectPointTheme } from '../../theme';
import { ConnectPointPosition } from '../../model';

export interface InputCircleIconDrawerProps {
	theme: Theme;
	size: CircleShapeSize;
	connectPointPosition: ConnectPointPosition;
	highlight?: boolean;
}

export const InputCircleIconDrawer = ({
	theme,
	size,
	highlight,
	connectPointPosition,
}: InputCircleIconDrawerProps) => {
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
};

