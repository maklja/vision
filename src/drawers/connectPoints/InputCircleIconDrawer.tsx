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
	const connectPointElementTheme = useConnectPointTheme(
		{ highlight, position: connectPointPosition },
		theme,
	);
	const radius = fromSize(size.radius, 0.2);

	return <Circle {...connectPointElementTheme.icon} listening={false} radius={radius} />;
};
