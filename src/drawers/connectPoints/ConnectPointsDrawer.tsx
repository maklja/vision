import { Group } from 'react-konva';
import { ConnectPointType } from '../../model';
import { ThemeContext } from '../../theme';
import { BoundingBox } from '../utils';
import { ConnectPointDrawer, ConnectPointDrawerEvent } from './ConnectPointDrawer';

export interface ConnectPointsDrawerEvent {
	id: string;
	connectPoint: ConnectPointDrawerEvent;
	element: BoundingBox;
}

export interface ConnectPointsDrawerProps {
	id: string;
	x: number;
	y: number;
	theme: ThemeContext;
	width?: number;
	height?: number;
	offset?: number;
	highlightConnectPoints?: ConnectPointType[];
	onMouseDown?: (cEvent: ConnectPointsDrawerEvent) => void;
	onMouseUp?: (cEvent: ConnectPointsDrawerEvent) => void;
	onMouseOver?: (cEvent: ConnectPointsDrawerEvent) => void;
	onMouseOut?: (cEvent: ConnectPointsDrawerEvent) => void;
}

export const ConnectPointsDrawer = ({
	id,
	x,
	y,
	width = 0,
	height = 0,
	offset = 0,
	theme,
	highlightConnectPoints,
	onMouseDown,
	onMouseUp,
	onMouseOver,
	onMouseOut,
}: ConnectPointsDrawerProps) => {
	const topX = x + width / 2;
	const topY = y - offset;

	const rightX = x + width + offset;
	const rightY = y + height / 2;

	const bottomX = x + width / 2;
	const bottomY = y + height + offset;

	const leftX = x - offset;
	const leftY = y + height / 2;

	const handleOnMouseDown = (cEvent: ConnectPointDrawerEvent) => {
		onMouseDown?.({
			id,
			connectPoint: cEvent,
			element: new BoundingBox(x, y, width, height),
		});
	};

	const handleOnMouseUp = (cEvent: ConnectPointDrawerEvent) => {
		onMouseUp?.({
			id,
			connectPoint: cEvent,
			element: new BoundingBox(x, y, width, height),
		});
	};

	const handleOnMouseOver = (cEvent: ConnectPointDrawerEvent) => {
		onMouseOver?.({
			id,
			connectPoint: cEvent,
			element: new BoundingBox(x, y, width, height),
		});
	};

	const handleOnMouseOut = (cEvent: ConnectPointDrawerEvent) => {
		onMouseOut?.({
			id,
			connectPoint: cEvent,
			element: new BoundingBox(x, y, width, height),
		});
	};

	return (
		<Group>
			<ConnectPointDrawer
				type={ConnectPointType.Top}
				x={topX}
				y={topY}
				theme={theme}
				onMouseDown={handleOnMouseDown}
				onMouseUp={handleOnMouseUp}
				onMouseOver={handleOnMouseOver}
				onMouseOut={handleOnMouseOut}
				highlight={highlightConnectPoints?.includes(ConnectPointType.Top)}
			/>

			<ConnectPointDrawer
				type={ConnectPointType.Right}
				x={rightX}
				y={rightY}
				theme={theme}
				onMouseDown={handleOnMouseDown}
				onMouseUp={handleOnMouseUp}
				onMouseOver={handleOnMouseOver}
				onMouseOut={handleOnMouseOut}
				highlight={highlightConnectPoints?.includes(ConnectPointType.Right)}
			/>

			<ConnectPointDrawer
				type={ConnectPointType.Bottom}
				x={bottomX}
				y={bottomY}
				theme={theme}
				onMouseDown={handleOnMouseDown}
				onMouseUp={handleOnMouseUp}
				onMouseOver={handleOnMouseOver}
				onMouseOut={handleOnMouseOut}
				highlight={highlightConnectPoints?.includes(ConnectPointType.Bottom)}
			/>

			<ConnectPointDrawer
				type={ConnectPointType.Left}
				x={leftX}
				y={leftY}
				theme={theme}
				onMouseDown={handleOnMouseDown}
				onMouseUp={handleOnMouseUp}
				onMouseOver={handleOnMouseOver}
				onMouseOut={handleOnMouseOut}
				highlight={highlightConnectPoints?.includes(ConnectPointType.Left)}
			/>
		</Group>
	);
};

