import { Group } from 'react-konva';
import { ConnectPointType } from '../../model';
import { ConnectPointTheme } from '../../theme';
import {
	BoundingBox,
	CONNECTOR_DEFAULT,
	createBoundingBox,
	DRAWER_DEFAULT,
	fromSize,
} from '../utils';
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
	size?: number;
	offset?: number;
	themes?: {
		[key in ConnectPointType]?: ConnectPointTheme;
	};
	onMouseDown?: (cEvent: ConnectPointsDrawerEvent) => void;
	onMouseUp?: (cEvent: ConnectPointsDrawerEvent) => void;
	onMouseOver?: (cEvent: ConnectPointsDrawerEvent) => void;
	onMouseOut?: (cEvent: ConnectPointsDrawerEvent) => void;
}

export const ConnectPointsDrawer = (props: ConnectPointsDrawerProps) => {
	const {
		id,
		x,
		y,
		size,
		offset = CONNECTOR_DEFAULT.offset,
		themes,
		onMouseDown,
		onMouseUp,
		onMouseOver,
		onMouseOut,
	} = props;

	const width = fromSize(DRAWER_DEFAULT.width, size);
	const height = fromSize(DRAWER_DEFAULT.height, size);

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
			element: createBoundingBox(x, y, size),
		});
	};

	const handleOnMouseUp = (cEvent: ConnectPointDrawerEvent) => {
		onMouseUp?.({
			id,
			connectPoint: cEvent,
			element: createBoundingBox(x, y, size),
		});
	};

	const handleOnMouseOver = (cEvent: ConnectPointDrawerEvent) => {
		onMouseOver?.({
			id,
			connectPoint: cEvent,
			element: createBoundingBox(x, y, size),
		});
	};

	const handleOnMouseOut = (cEvent: ConnectPointDrawerEvent) => {
		onMouseOut?.({
			id,
			connectPoint: cEvent,
			element: createBoundingBox(x, y, size),
		});
	};

	return (
		<Group>
			<ConnectPointDrawer
				type={ConnectPointType.Top}
				x={topX}
				y={topY}
				size={size}
				onMouseDown={handleOnMouseDown}
				onMouseUp={handleOnMouseUp}
				onMouseOver={handleOnMouseOver}
				onMouseOut={handleOnMouseOut}
				theme={themes?.[ConnectPointType.Top]}
			/>

			<ConnectPointDrawer
				type={ConnectPointType.Right}
				x={rightX}
				y={rightY}
				size={size}
				onMouseDown={handleOnMouseDown}
				onMouseUp={handleOnMouseUp}
				onMouseOver={handleOnMouseOver}
				onMouseOut={handleOnMouseOut}
				theme={themes?.[ConnectPointType.Right]}
			/>

			<ConnectPointDrawer
				type={ConnectPointType.Bottom}
				x={bottomX}
				y={bottomY}
				size={size}
				onMouseDown={handleOnMouseDown}
				onMouseUp={handleOnMouseUp}
				onMouseOver={handleOnMouseOver}
				onMouseOut={handleOnMouseOut}
				theme={themes?.[ConnectPointType.Bottom]}
			/>

			<ConnectPointDrawer
				type={ConnectPointType.Left}
				x={leftX}
				y={leftY}
				size={size}
				onMouseDown={handleOnMouseDown}
				onMouseUp={handleOnMouseUp}
				onMouseOver={handleOnMouseOver}
				onMouseOut={handleOnMouseOut}
				theme={themes?.[ConnectPointType.Left]}
			/>
		</Group>
	);
};

