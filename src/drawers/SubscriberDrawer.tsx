import { useState } from 'react';
import { Circle, Group } from 'react-konva';
import { StateEvent, useStageState } from '../state';
import { DRAWER_DEFAULT, fromSize } from './utils';

export interface SubscriberDrawerProps {
	id: string;
	x: number;
	y: number;
	size: number;
}

export const SubscriberDrawer = (props: SubscriberDrawerProps) => {
	const { theme } = useStageState();
	const [stateEvent, setStateEvent] = useState<StateEvent>(StateEvent.Default);

	const { x, y, size, id } = props;
	const radius = fromSize(DRAWER_DEFAULT.radius, size, 0.8);
	const innerRadius = fromSize(DRAWER_DEFAULT.radius, size, 0.5);

	const handleMouseOver = () => {
		setStateEvent(StateEvent.Hover);
	};

	const handleMouseLeave = () => {
		setStateEvent(StateEvent.Default);
	};

	return (
		<Group draggable onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave}>
			<Circle {...theme[stateEvent]} id={id} x={x} y={y} radius={radius} fill="transparent" />
			<Circle {...theme[stateEvent]} x={x} y={y} radius={innerRadius} listening={false} />
		</Group>
	);
};
