import Konva from 'konva';
import { useState } from 'react';
import { Circle, Group } from 'react-konva';
import { connectionTheme, highlightConnectionTheme } from '../theme';
import { CONNECTOR_DEFAULT } from './utils';

export enum ConnectionPoint {
	Top = 'top',
	Right = 'right',
	Bottom = 'bottom',
	Left = 'left',
}

interface ConnectorProps {
	position: ConnectionPoint;
	x: number;
	y: number;
	radius: number;
	offsetX?: number;
	offsetY?: number;
	onMouseDown?: (point: ConnectionPoint, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseOver?: (point: ConnectionPoint, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseOut?: (point: ConnectionPoint, e: Konva.KonvaEventObject<MouseEvent>) => void;
}

const Connector = (props: ConnectorProps) => {
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
}

export const RectConnectionPoints = (props: RectConnectionPointsProps) => {
	const {
		x = 0,
		y = 0,
		width = 0,
		height = 0,
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

	return (
		<Group>
			<Connector
				position={ConnectionPoint.Top}
				x={topX}
				y={topY}
				radius={connectRadius}
				offsetY={offset}
				onMouseDown={handleOnMouseDown}
			/>

			<Connector
				position={ConnectionPoint.Right}
				x={rightX}
				y={rightY}
				radius={connectRadius}
				offsetX={-offset}
				onMouseDown={handleOnMouseDown}
			/>

			<Connector
				position={ConnectionPoint.Bottom}
				x={bottomX}
				y={bottomY}
				radius={connectRadius}
				offsetY={-offset}
				onMouseDown={handleOnMouseDown}
			/>

			<Connector
				position={ConnectionPoint.Left}
				x={leftX}
				y={leftY}
				radius={connectRadius}
				offsetX={offset}
				onMouseDown={handleOnMouseDown}
			/>
		</Group>
	);
};

