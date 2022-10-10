import { Circle, Group } from 'react-konva';
import { BorderElement } from './BorderElement';
import { DRAWER_DEFAULT, fromSize } from './utils';
import { elementTheme } from '../theme';
import { ElementProps, elementConnector } from '../store/connector';

export const SubscriberElement = (props: ElementProps) => {
	const { x = 0, y = 0, size, id, onMouseDown, onMouseOut, onMouseOver } = props;
	const radius = fromSize(DRAWER_DEFAULT.radius, size, 0.8);
	const innerRadius = fromSize(DRAWER_DEFAULT.radius, size, 0.5);

	const handleMouseOver = () => onMouseOver && onMouseOver(id);

	const handleMouseOut = () => onMouseOut && onMouseOut(id);

	const handleMouseDown = () => onMouseDown && onMouseDown(id);

	return (
		<Group
			draggable
			onMouseDown={handleMouseDown}
			onMouseOver={handleMouseOver}
			onMouseOut={handleMouseOut}
		>
			<BorderElement
				x={x - radius}
				y={y - radius}
				width={radius * 2}
				height={radius * 2}
				padding={2}
				state={props.state}
			/>
			<Circle {...elementTheme} id={id} x={x} y={y} radius={radius} fill="transparent" />
			<Circle {...elementTheme} x={x} y={y} radius={innerRadius} listening={false} />
		</Group>
	);
};

export const ConnectedSubscriberElement = elementConnector(SubscriberElement);
