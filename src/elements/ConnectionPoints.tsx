import Konva from 'konva';
import { useState } from 'react';
import { Circle, Group, Line } from 'react-konva';
import { ConnectionPoint } from '../model';
import { connectionTheme, highlightConnectionTheme } from '../theme';
import { CONNECTOR_DEFAULT } from './utils';

interface ConnectorProps {
	position: ConnectionPoint;
	x: number;
	y: number;
	radius: number;
	selected?: boolean;
	offsetX?: number;
	offsetY?: number;
	onMouseDown?: (point: ConnectionPoint, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseOver?: (point: ConnectionPoint, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseOut?: (point: ConnectionPoint, e: Konva.KonvaEventObject<MouseEvent>) => void;
}

const Connector = (props: ConnectorProps) => {
	if (!props.selected) {
		return null;
	}

	const [highlight, setHighlight] = useState(false);

	const handleMouseOver = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		setHighlight(true);
		props.onMouseOver && props.onMouseOver(props.position, e);
	};

	const handleMouseOut = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		setHighlight(false);
		props.onMouseOut && props.onMouseOut(props.position, e);
	};

	return (
		<Circle
			x={props.x}
			y={props.y}
			radius={props.radius}
			offsetX={props.offsetX}
			offsetY={props.offsetY}
			onMouseDown={(e) => props.onMouseDown && props.onMouseDown(props.position, e)}
			onMouseOver={handleMouseOver}
			onMouseOut={handleMouseOut}
			{...(highlight ? highlightConnectionTheme : connectionTheme)}
		/>
	);
};

export interface RectConnectionPointsProps {
	id: string;
	x?: number;
	y?: number;
	width?: number;
	height?: number;
	connectRadius?: number;
	offset?: number;
	selected?: boolean;
	connectedPoints?: ConnectionPoint[];
}

export const RectConnectionPoints = (props: RectConnectionPointsProps) => {
	const {
		x = 0,
		y = 0,
		width = 0,
		height = 0,
		selected,
		connectedPoints = [],
		connectRadius = CONNECTOR_DEFAULT.radius,
		offset = CONNECTOR_DEFAULT.offset,
	} = props;

	const topX = x + width / 2;
	const topY = y;

	const rightX = x + width;
	const rightY = y + height / 2;

	const leftX = x;
	const leftY = y + height / 2;

	const bottomX = x + width / 2;
	const bottomY = y + height;

	const handleOnMouseDown = (_: ConnectionPoint, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		console.log('called');
	};

	const isTopConnected = connectedPoints.includes(ConnectionPoint.Top);
	const isRightConnected = connectedPoints.includes(ConnectionPoint.Right);
	const isBottomConnected = connectedPoints.includes(ConnectionPoint.Bottom);
	const isLeftConnected = connectedPoints.includes(ConnectionPoint.Left);

	return (
		<Group>
			<Connector
				position={ConnectionPoint.Top}
				x={topX}
				y={topY}
				radius={connectRadius}
				offsetY={offset}
				selected={selected}
				onMouseDown={handleOnMouseDown}
			/>
			{isTopConnected ? (
				<Line points={[topX, topY - offset, topX, topY]} stroke="black" />
			) : null}
			<Connector
				position={ConnectionPoint.Right}
				x={rightX}
				y={rightY}
				radius={connectRadius}
				offsetX={-offset}
				selected={selected}
				onMouseDown={handleOnMouseDown}
			/>
			{isRightConnected ? (
				<Line points={[rightX, rightY, rightX + offset, rightY]} stroke="black" />
			) : null}
			<Connector
				position={ConnectionPoint.Bottom}
				x={bottomX}
				y={bottomY}
				radius={connectRadius}
				offsetY={-offset}
				selected={selected}
				onMouseDown={handleOnMouseDown}
			/>

			<Connector
				position={ConnectionPoint.Left}
				x={leftX}
				y={leftY}
				radius={connectRadius}
				offsetX={offset}
				selected={selected}
				onMouseDown={handleOnMouseDown}
			/>
			{isLeftConnected ? (
				<Line points={[leftX, leftY, leftX - offset, leftY]} stroke="black" />
			) : null}
		</Group>
	);
};

