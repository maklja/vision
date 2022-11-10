import { ConnectPointsDrawer, BorderDrawer, ConnectPointsDrawerEvent } from '../../drawers';
import { ConnectPointType } from '../../model';
import { Group } from 'react-konva';
import { selectedBorderTheme, highlightBorderTheme, useDrawerTheme } from '../../theme';
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
	const { connectPoint: connectPointTheme } = useDrawerTheme();
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
					themes={{
						[ConnectPointType.Top]: {
							...(highlightedConnectPoints.includes(ConnectPointType.Top)
								? connectPointTheme.highlightElement
								: connectPointTheme.element),
						},
						[ConnectPointType.Bottom]: {
							...(highlightedConnectPoints.includes(ConnectPointType.Bottom)
								? connectPointTheme.highlightElement
								: connectPointTheme.element),
						},
						[ConnectPointType.Left]: {
							...(highlightedConnectPoints.includes(ConnectPointType.Left)
								? connectPointTheme.highlightElement
								: connectPointTheme.element),
						},
						[ConnectPointType.Right]: {
							...(highlightedConnectPoints.includes(ConnectPointType.Right)
								? connectPointTheme.highlightElement
								: connectPointTheme.element),
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

