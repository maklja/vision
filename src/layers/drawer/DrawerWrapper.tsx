import { ConnectPointsDrawer, BorderDrawer, ConnectPointsDrawerEvent } from '../../drawers';
import { ConnectPointType } from '../../model';
import { Group } from 'react-konva';
import {
	selectedBorderTheme,
	highlightBorderTheme,
	connectPointTheme,
	highlightConnectPointTheme,
} from '../../theme';
import { PropsWithChildren } from 'react';

export interface DrawerWrapperProps {
	id: string;
	x: number;
	y: number;
	size: number;
	selected: boolean;
	highlighted: boolean;
	visibleConnectionPoints: boolean;
	highlightedConnectPoints: ConnectPointType[];
	onConnectPointMouseDown?: (cEvent: ConnectPointsDrawerEvent) => void;
	onConnectPointMouseUp?: (cEvent: ConnectPointsDrawerEvent) => void;
	onConnectPointMouseOver?: (cEvent: ConnectPointsDrawerEvent) => void;
	onConnectPointMouseOut?: (cEvent: ConnectPointsDrawerEvent) => void;
}

export const DrawerWrapper = ({
	children,
	x,
	y,
	size,
	id,
	visibleConnectionPoints,
	selected,
	highlighted,
	highlightedConnectPoints,
	onConnectPointMouseDown,
	onConnectPointMouseUp,
	onConnectPointMouseOver,
	onConnectPointMouseOut,
}: PropsWithChildren<DrawerWrapperProps>) => {
	const borderStyle = {
		...(highlighted ? highlightBorderTheme : {}),
		...(selected ? selectedBorderTheme : {}),
	};

	return (
		<Group>
			{visibleConnectionPoints ? (
				<ConnectPointsDrawer
					onMouseDown={onConnectPointMouseDown}
					onMouseUp={onConnectPointMouseUp}
					onMouseOut={onConnectPointMouseOut}
					onMouseOver={onConnectPointMouseOver}
					id={id}
					x={x}
					y={y}
					size={size}
					styles={{
						[ConnectPointType.Top]: {
							...connectPointTheme,
							...(highlightedConnectPoints.includes(ConnectPointType.Top)
								? highlightConnectPointTheme
								: {}),
						},
						[ConnectPointType.Bottom]: {
							...connectPointTheme,
							...(highlightedConnectPoints.includes(ConnectPointType.Bottom)
								? highlightConnectPointTheme
								: {}),
						},
						[ConnectPointType.Left]: {
							...connectPointTheme,
							...(highlightedConnectPoints.includes(ConnectPointType.Left)
								? highlightConnectPointTheme
								: {}),
						},
						[ConnectPointType.Right]: {
							...connectPointTheme,
							...(highlightedConnectPoints.includes(ConnectPointType.Right)
								? highlightConnectPointTheme
								: {}),
						},
					}}
				/>
			) : null}

			{selected || highlighted ? (
				<BorderDrawer x={x} y={y} size={size} padding={3} style={borderStyle} />
			) : null}

			{children}
		</Group>
	);
};

