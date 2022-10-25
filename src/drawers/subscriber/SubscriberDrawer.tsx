import Konva from 'konva';
import { Circle, Group } from 'react-konva';
import { DRAWER_DEFAULT, fromSize } from '../utils';
import { elementTheme } from '../../theme';
import { ElementProps } from '../ElementProps';

export const SubscriberDrawer = (props: ElementProps) => {
	const {
		x,
		y,
		size,
		id,
		onMouseDown,
		onMouseOut,
		onMouseOver,
		onDragMove,
		onDragStart,
		onDragEnd,
	} = props;
	const radius = fromSize(DRAWER_DEFAULT.radius, size, 0.8);
	const innerRadius = fromSize(DRAWER_DEFAULT.radius, size, 0.5);

	const handleMouseOver = (e: Konva.KonvaEventObject<MouseEvent>) => onMouseOver?.(id, e);

	const handleMouseOut = (e: Konva.KonvaEventObject<MouseEvent>) => onMouseOut?.(id, e);

	const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => onMouseDown?.(id, e);

	const handleDragMove = (e: Konva.KonvaEventObject<MouseEvent>) => onDragMove?.(id, e);

	const handleDragStart = (e: Konva.KonvaEventObject<MouseEvent>) => onDragStart?.(id, e);

	const handleDragEnd = (e: Konva.KonvaEventObject<MouseEvent>) => onDragEnd?.(id, e);

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
			<Circle {...elementTheme} id={id} radius={radius} />
			<Circle {...elementTheme} radius={innerRadius} listening={false} fill="black" />
		</Group>
	);
};
