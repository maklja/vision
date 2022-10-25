import Konva from 'konva';
import { useState } from 'react';
import { Circle } from 'react-konva';
import { Animation, useAnimation } from '../../animations';
import { ConnectPointType } from '../../model';
import { ConnectPointStyle } from '../../theme';
import { CONNECTOR_DEFAULT, fromSize } from '../utils';

export interface ConnectPointDrawerEvent {
	type: ConnectPointType;
	x: number;
	y: number;
}

export interface ConnectPointDrawerProps {
	type: ConnectPointType;
	x: number;
	y: number;
	size?: number;
	style?: ConnectPointStyle;
	animation?: Animation;
	onMouseDown?: (event: ConnectPointDrawerEvent, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseUp?: (event: ConnectPointDrawerEvent, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseOver?: (event: ConnectPointDrawerEvent, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseOut?: (event: ConnectPointDrawerEvent, e: Konva.KonvaEventObject<MouseEvent>) => void;
}

export const ConnectPointDrawer = (props: ConnectPointDrawerProps) => {
	const {
		type,
		x,
		y,
		size = 1,
		onMouseDown,
		onMouseUp,
		onMouseOver,
		onMouseOut,
		animation,
	} = props;
	const [circleRef, setCircleRef] = useState<Konva.Circle | null>(null);
	const anime = useAnimation(circleRef, animation);

	const handleMouseOver = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		const { x, y } = e.currentTarget.getAbsolutePosition();
		onMouseOver?.({ type, x, y }, e);
		console.log('over');
		anime?.playAnimation();
	};

	const handleMouseOut = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		const { x, y } = e.currentTarget.getAbsolutePosition();
		onMouseOut?.({ type, x, y }, e);
		anime?.reverseAnimation();
	};

	const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		const { x, y } = e.currentTarget.getAbsolutePosition();
		onMouseDown?.({ type, x, y }, e);
	};

	const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		const { x, y } = e.currentTarget.getAbsolutePosition();
		onMouseUp?.({ type, x, y }, e);
	};

	const radius = fromSize(CONNECTOR_DEFAULT.radius, size);

	return (
		<Circle
			{...props.style}
			ref={(node) => setCircleRef(node)}
			x={x}
			y={y}
			radius={radius}
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
			onMouseOver={handleMouseOver}
			onMouseOut={handleMouseOut}
		/>
	);
};

