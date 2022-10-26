import Konva from 'konva';
import { Group } from 'react-konva';
import { ConnectPointType } from '../../model';
import { ConnectPointStyle } from '../../theme';
import { CONNECTOR_DEFAULT } from '../utils';
import { ConnectPointDrawer, ConnectPointDrawerEvent } from './ConnectPointDrawer';

export interface ConnectPointsDrawerEvent {
	id: string;
	connectPoint: ConnectPointDrawerEvent;
}

export interface ConnectPointsDrawerProps {
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
	size?: number;
	offset?: number;
	styles?: {
		[key in ConnectPointType]?: ConnectPointStyle;
	};
	onMouseDown?: (cEvent: ConnectPointsDrawerEvent, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseUp?: (cEvent: ConnectPointsDrawerEvent, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseOver?: (cEvent: ConnectPointsDrawerEvent, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseOut?: (cEvent: ConnectPointsDrawerEvent, e: Konva.KonvaEventObject<MouseEvent>) => void;
}

export const ConnectPointsDrawer = (props: ConnectPointsDrawerProps) => {
	const {
		id,
		x,
		y,
		width,
		height,
		size,
		offset = CONNECTOR_DEFAULT.offset,
		styles,
		onMouseDown,
		onMouseUp,
		onMouseOver,
		onMouseOut,
	} = props;

	const topX = x + width / 2;
	const topY = y - offset;

	const rightX = x + width + offset;
	const rightY = y + height / 2;

	const bottomX = x + width / 2;
	const bottomY = y + height + offset;

	const leftX = x - offset;
	const leftY = y + height / 2;

	const handleOnMouseDown = (
		cEvent: ConnectPointDrawerEvent,
		e: Konva.KonvaEventObject<MouseEvent>,
	) => {
		onMouseDown?.(
			{
				id,
				connectPoint: cEvent,
			},
			e,
		);
	};

	const handleOnMouseUp = (
		cEvent: ConnectPointDrawerEvent,
		e: Konva.KonvaEventObject<MouseEvent>,
	) => {
		onMouseUp?.(
			{
				id,
				connectPoint: cEvent,
			},
			e,
		);
	};

	const handleOnMouseOver = (
		cEvent: ConnectPointDrawerEvent,
		e: Konva.KonvaEventObject<MouseEvent>,
	) => {
		onMouseOver?.(
			{
				id,
				connectPoint: cEvent,
			},
			e,
		);
	};

	const handleOnMouseOut = (
		cEvent: ConnectPointDrawerEvent,
		e: Konva.KonvaEventObject<MouseEvent>,
	) => {
		onMouseOut?.(
			{
				id,
				connectPoint: cEvent,
			},
			e,
		);
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
				style={styles?.[ConnectPointType.Top]}
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
				style={styles?.[ConnectPointType.Right]}
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
				style={styles?.[ConnectPointType.Bottom]}
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
				style={styles?.[ConnectPointType.Left]}
			/>
		</Group>
	);
};
