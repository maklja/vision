import Konva from 'konva';
import { useEffect, useState } from 'react';
import { Circle } from 'react-konva';
import { ConnectionPoint } from '../../model';
import { connectionTheme, highlightConnectionTheme } from '../../theme';
import { CONNECTOR_DEFAULT, fromSize } from '../utils';

export interface ConnectPointDrawerEvent {
	position: ConnectionPoint;
	x: number;
	y: number;
}

export interface ConnectPointDrawerProps {
	position: ConnectionPoint;
	x: number;
	y: number;
	size?: number;
	onMouseDown?: (event: ConnectPointDrawerEvent, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseUp?: (event: ConnectPointDrawerEvent, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseOver?: (event: ConnectPointDrawerEvent, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseOut?: (event: ConnectPointDrawerEvent, e: Konva.KonvaEventObject<MouseEvent>) => void;
}

export const ConnectPointDrawer = (props: ConnectPointDrawerProps) => {
	const { position, x, y, size = 1, onMouseDown, onMouseUp, onMouseOver, onMouseOut } = props;
	const [circleRef, setCircleRef] = useState<Konva.Circle | null>(null);
	const [highlight, setHighlight] = useState(false);

	const handleMouseOver = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		setHighlight(true);
		const { x, y } = e.currentTarget.getAbsolutePosition();
		onMouseOver?.({ position, x, y }, e);
	};

	const handleMouseOut = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		setHighlight(false);
		const { x, y } = e.currentTarget.getAbsolutePosition();
		onMouseOut?.({ position, x, y }, e);
	};

	const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		const { x, y } = e.currentTarget.getAbsolutePosition();
		onMouseDown?.({ position, x, y }, e);
	};

	const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		const { x, y } = e.currentTarget.getAbsolutePosition();
		onMouseUp?.({ position, x, y }, e);
	};

	useEffect(() => {
		if (!circleRef) {
			return;
		}

		// const tween = new Konva.Tween({
		// 	node: circleRef,
		// 	duration: 1,
		// 	// x: 140,
		// 	// y: 90,
		// 	fill: 'green',
		// 	// rotation: Math.PI * 2,
		// 	opacity: 1,
		// 	// strokeWidth: 6,
		// 	scaleX: 1.4,
		// 	scaleY: 1.4,
		// });

		// tween.onFinish = () => {
		// 	tween.reverse();
		// };
		// tween.onReset = () => {
		// 	tween.play();
		// };
		// tween.play();

		// return () => tween.destroy();
		circleRef.to({
			opacity: 1,
			duration: 0.2,
		});
	}, [circleRef]);

	const radius = fromSize(CONNECTOR_DEFAULT.radius, size);

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
			opacity={0.7}
			{...(highlight ? highlightConnectionTheme : connectionTheme)}
		/>
	);
};
