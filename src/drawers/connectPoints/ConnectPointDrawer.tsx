import Konva from 'konva';
import { useEffect, useState } from 'react';
import { Circle } from 'react-konva';
import { ConnectPointType } from '../../model';
import { ConnectPointStyle, snapConnectPointAnimation, AnimationControl } from '../../theme';
import { CONNECTOR_DEFAULT, fromSize } from '../utils';

export interface ConnectPointAnimation {
	snapConnectPoint: AnimationControl;
}

export interface ConnectPointDrawerEvent {
	type: ConnectPointType;
	x: number;
	y: number;
	animations: ConnectPointAnimation | null;
}

export interface ConnectPointDrawerProps {
	type: ConnectPointType;
	x: number;
	y: number;
	size?: number;
	style?: ConnectPointStyle;
	onMouseDown?: (event: ConnectPointDrawerEvent, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseUp?: (event: ConnectPointDrawerEvent, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseOver?: (event: ConnectPointDrawerEvent, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseOut?: (event: ConnectPointDrawerEvent, e: Konva.KonvaEventObject<MouseEvent>) => void;
}

export const ConnectPointDrawer = (props: ConnectPointDrawerProps) => {
	const { type, x, y, size = 1, onMouseDown, onMouseUp, onMouseOver, onMouseOut } = props;
	const [circleRef, setCircleRef] = useState<Konva.Circle | null>(null);
	const [animations, setAnimations] = useState<ConnectPointAnimation | null>(null);

	const handleMouseOver = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		onMouseOver?.({ type, x, y, animations }, e);
	};

	const handleMouseOut = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		onMouseOut?.({ type, x, y, animations }, e);
	};

	const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		onMouseDown?.({ type, x, y, animations }, e);
	};

	const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		onMouseUp?.({ type, x, y, animations }, e);
	};

	const radius = fromSize(CONNECTOR_DEFAULT.radius, size);

	useEffect(() => {
		if (!circleRef) {
			return;
		}

		setAnimations({
			snapConnectPoint: snapConnectPointAnimation(circleRef),
		});

		return () => {
			if (animations) {
				Object.values(animations).forEach((animation: AnimationControl) =>
					animation.destroy(),
				);
			}
		};
	}, [circleRef]);

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

