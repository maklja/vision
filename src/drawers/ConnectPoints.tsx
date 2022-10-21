import Konva from 'konva';
import { useEffect, useState } from 'react';
import { Circle, Group } from 'react-konva';
import { ConnectionPoint } from '../model';
import { connectionTheme, highlightConnectionTheme } from '../theme';
import { CONNECTOR_DEFAULT } from './utils';

export interface ConnectPointEvent {
	position: ConnectionPoint;
	x: number;
	y: number;
}

export interface ConnectPointProps {
	position: ConnectionPoint;
	x: number;
	y: number;
	radius: number;
	selected?: boolean;
	onMouseDown?: (event: ConnectPointEvent, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseUp?: (event: ConnectPointEvent, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseOver?: (event: ConnectPointEvent, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseOut?: (event: ConnectPointEvent, e: Konva.KonvaEventObject<MouseEvent>) => void;
}

export const ConnectPoint = (props: ConnectPointProps) => {
	if (!props.selected) {
		return null;
	}

	const { position, x, y, radius, onMouseDown, onMouseUp, onMouseOver, onMouseOut } = props;
	const [circleRef, setCircleRef] = useState<Konva.Circle | null>(null);
	const [highlight, setHighlight] = useState(false);

	const handleMouseOver = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		setHighlight(true);
		const { x, y } = e.currentTarget.getAbsolutePosition();
		onMouseOver && onMouseOver({ position, x, y }, e);
	};

	const handleMouseOut = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		setHighlight(false);
		const { x, y } = e.currentTarget.getAbsolutePosition();
		onMouseOut && onMouseOut({ position, x, y }, e);
	};

	const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		const { x, y } = e.currentTarget.getAbsolutePosition();
		onMouseDown && onMouseDown({ position, x, y }, e);
	};

	const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		const { x, y } = e.currentTarget.getAbsolutePosition();
		onMouseUp && onMouseUp({ position, x, y }, e);
	};

	useEffect(() => {
		if (!circleRef) {
			return;
		}

		circleRef.to({
			opacity: 1,
			duration: 0.2,
		});
	}, [circleRef]);

	return (
		<Circle
			ref={(node) => setCircleRef(node)}
			x={x}
			y={y}
			radius={radius}
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
			onMouseOver={handleMouseOver}
			onMouseOut={handleMouseOut}
			opacity={0}
			{...(highlight ? highlightConnectionTheme : connectionTheme)}
		/>
	);
};

export interface ConnectionPointsEvent {
	id: string;
	element: {
		x: number;
		y: number;
	};
	connector: {
		x: number;
		y: number;
	};
}

export interface ConnectPointsProps {
	id: string;
	x: number;
	y: number;
	absoluteX: number;
	absoluteY: number;
	width: number;
	height: number;
	connectRadius?: number;
	offset?: number;
	selected?: boolean;
	dragging?: boolean;
	onMouseDown?: (cEvent: ConnectionPointsEvent, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseUp?: (cEvent: ConnectionPointsEvent, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseOver?: (cEvent: ConnectionPointsEvent, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseOut?: (cEvent: ConnectionPointsEvent, e: Konva.KonvaEventObject<MouseEvent>) => void;
}

export const ConnectPoints = (props: ConnectPointsProps) => {
	if (props.dragging) {
		return null;
	}

	const {
		id,
		absoluteX,
		absoluteY,
		x,
		y,
		width,
		height,
		selected,
		connectRadius = CONNECTOR_DEFAULT.radius,
		offset = CONNECTOR_DEFAULT.offset,
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
		cEvent: ConnectPointEvent,
		e: Konva.KonvaEventObject<MouseEvent>,
	) => {
		onMouseDown?.(
			{
				id,
				element: {
					x: absoluteX,
					y: absoluteY,
				},
				connector: cEvent,
			},
			e,
		);
	};

	const handleOnMouseUp = (cEvent: ConnectPointEvent, e: Konva.KonvaEventObject<MouseEvent>) => {
		onMouseUp?.(
			{
				id,
				element: {
					x: absoluteX,
					y: absoluteY,
				},
				connector: cEvent,
			},
			e,
		);
	};

	const handleOnMouseOver = (
		cEvent: ConnectPointEvent,
		e: Konva.KonvaEventObject<MouseEvent>,
	) => {
		onMouseOver?.(
			{
				id,
				element: {
					x: absoluteX,
					y: absoluteY,
				},
				connector: cEvent,
			},
			e,
		);
	};

	const handleOnMouseOut = (cEvent: ConnectPointEvent, e: Konva.KonvaEventObject<MouseEvent>) => {
		onMouseOut?.(
			{
				id,
				element: {
					x: absoluteX,
					y: absoluteY,
				},
				connector: cEvent,
			},
			e,
		);
	};

	return (
		<Group>
			<ConnectPoint
				position={ConnectionPoint.Top}
				x={topX}
				y={topY}
				radius={connectRadius}
				selected={selected}
				onMouseDown={handleOnMouseDown}
				onMouseUp={handleOnMouseUp}
				onMouseOver={handleOnMouseOver}
				onMouseOut={handleOnMouseOut}
			/>

			<ConnectPoint
				position={ConnectionPoint.Right}
				x={rightX}
				y={rightY}
				radius={connectRadius}
				selected={selected}
				onMouseDown={handleOnMouseDown}
				onMouseUp={handleOnMouseUp}
				onMouseOver={handleOnMouseOver}
				onMouseOut={handleOnMouseOut}
			/>

			<ConnectPoint
				position={ConnectionPoint.Bottom}
				x={bottomX}
				y={bottomY}
				radius={connectRadius}
				selected={selected}
				onMouseDown={handleOnMouseDown}
				onMouseUp={handleOnMouseUp}
				onMouseOver={handleOnMouseOver}
				onMouseOut={handleOnMouseOut}
			/>

			<ConnectPoint
				position={ConnectionPoint.Left}
				x={leftX}
				y={leftY}
				radius={connectRadius}
				selected={selected}
				onMouseDown={handleOnMouseDown}
				onMouseUp={handleOnMouseUp}
				onMouseOver={handleOnMouseOver}
				onMouseOut={handleOnMouseOut}
			/>
		</Group>
	);
};

