import { Circle, Group } from 'react-konva';
import { BorderElement } from './BorderElement';
import { DRAWER_DEFAULT, fromSize } from './utils';
import { elementTheme } from '../theme';
import { ElementProps, elementConnector } from '../store/connector';
import Konva from 'konva';
import { ConnectedConnectPoints } from './ConnectedConnectPoints';
import { ElementState } from './ElementState';

export const SubscriberElement = (props: ElementProps) => {
	const {
		x = 0,
		y = 0,
		size,
		id,
		state,
		dragging,
		onMouseDown,
		onMouseOut,
		onMouseOver,
		onDragMove,
		onDragStart,
		onDragEnd,
	} = props;
	const radius = fromSize(DRAWER_DEFAULT.radius, size, 0.8);
	const innerRadius = fromSize(DRAWER_DEFAULT.radius, size, 0.5);

	const handleMouseOver = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onMouseOver && onMouseOver(id, e);

	const handleMouseOut = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onMouseOut && onMouseOut(id, e);

	const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onMouseDown && onMouseDown(id, e);

	const handleDragMove = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onDragMove && onDragMove(id, e);

	const handleDragStart = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onDragStart && onDragStart(id, e);

	const handleDragEnd = (e: Konva.KonvaEventObject<MouseEvent>) => onDragEnd && onDragEnd(id, e);

	return (
		<Group
			x={x}
			y={y}
			draggable
			onMouseDown={handleMouseDown}
			onMouseOver={handleMouseOver}
			onMouseOut={handleMouseOut}
			onDragMove={handleDragMove}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<BorderElement
				x={radius * -1}
				y={radius * -1}
				width={radius * 2}
				height={radius * 2}
				padding={2}
				state={state}
			/>
			<ConnectedConnectPoints
				id={id}
				absoluteX={x}
				absoluteY={y}
				x={radius * -1}
				y={radius * -1}
				width={radius * 2}
				height={radius * 2}
				selected={state === ElementState.Selected}
				dragging={dragging}
			/>
			<Circle {...elementTheme} id={id} radius={radius} />
			<Circle {...elementTheme} radius={innerRadius} listening={false} fill="black" />
		</Group>
	);
};

export const ConnectedSubscriberElement = elementConnector(SubscriberElement);

