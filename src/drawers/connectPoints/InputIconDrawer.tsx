import { Circle } from 'react-konva';
import { Theme, useConnectPointTheme, useSizes } from '../../theme';
import { ConnectPointPosition } from '../../model';

export interface InputIconDrawerProps {
	theme: Theme;
	connectPointPosition: ConnectPointPosition;
	highlight?: boolean;
}

export const InputIconDrawer = ({
	theme,
	highlight,
	connectPointPosition,
}: InputIconDrawerProps) => {
	const connectPointElementTheme = useConnectPointTheme(
		{ highlight, position: connectPointPosition },
		theme,
	);
	const { connectPointSizes } = useSizes(theme, 1, 0.2);

	return (
		<Circle
			{...connectPointElementTheme.icon}
			listening={false}
			radius={connectPointSizes.radius}
		/>
	);
};

