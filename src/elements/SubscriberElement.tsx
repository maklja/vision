import { Circle, Group } from 'react-konva';
import { BorderElement } from './BorderElement';
import { DRAWER_DEFAULT, fromSize } from './utils';
import { elementTheme } from '../theme';
import { ElementProps, elementConnector } from '../store/connector';
import Konva from 'konva';

export const SubscriberElement = (props: ElementProps) => {
	const { x = 0, y = 0, size, id, onMouseDown, onMouseOut, onMouseOver, onMouseDrag } = props;
	const radius = fromSize(DRAWER_DEFAULT.radius, size, 0.8);
	const innerRadius = fromSize(DRAWER_DEFAULT.radius, size, 0.5);

	const handleMouseOver = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onMouseOver && onMouseOver(id, e);

	const handleMouseOut = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onMouseOut && onMouseOut(id, e);

	const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onMouseDown && onMouseDown(id, e);

	const handleDragMove = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onMouseDrag && onMouseDrag(id, e);

	return (
		<Group
			x={x}
			y={y}
			draggable
			onMouseDown={handleMouseDown}
			onMouseOver={handleMouseOver}
			onMouseOut={handleMouseOut}
			onDragMove={handleDragMove}
		>
			<BorderElement
				x={radius * -1}
				y={radius * -1}
				width={radius * 2}
				height={radius * 2}
				padding={2}
				state={props.state}
			/>
			<Circle {...elementTheme} id={id} radius={radius} fill="transparent" />
			<Circle {...elementTheme} radius={innerRadius} listening={false} />
		</Group>
	);
};

export const ConnectedSubscriberElement = elementConnector(SubscriberElement);

