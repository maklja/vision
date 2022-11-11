import { ConnectPointsDrawer, ConnectPointsDrawerEvent } from '../../drawers';
import { ConnectPointType } from '../../model';
import { Group } from 'react-konva';
import { PropsWithChildren } from 'react';

export interface DrawerWrapperProps {
	id: string;
	x: number;
	y: number;
	size: number;
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
	highlightedConnectPoints,
	onConnectPointMouseDown,
	onConnectPointMouseUp,
	onConnectPointMouseOver,
	onConnectPointMouseOut,
}: PropsWithChildren<DrawerWrapperProps>) => {
	return (
		<Group>
			{/* {visibleConnectionPoints ? (
				<ConnectPointsDrawer
					onMouseDown={onConnectPointMouseDown}
					onMouseUp={onConnectPointMouseUp}
					onMouseOut={onConnectPointMouseOut}
					onMouseOver={onConnectPointMouseOver}
					id={id}
					x={x}
					y={y}
					size={size}
					highlightConnectPoints={highlightedConnectPoints}
				/>
			) : null} */}

			{children}
		</Group>
	);
};
