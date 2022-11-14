import Konva from 'konva';
import { useEffect, useState } from 'react';
import { Circle } from 'react-konva';
import { Animation } from '../../animation';
import { ConnectPointType } from '../../model';
import { useConnectPointTheme } from '../../store/stageSlice';
import { snapConnectPointAnimation } from '../../theme';

export interface ConnectPointAnimation {
	snapConnectPoint: Animation;
}

export interface ConnectPointDrawerEvent {
	type: ConnectPointType;
	x: number;
	y: number;
	animations: ConnectPointAnimation | null;
	originalEvent: Konva.KonvaEventObject<MouseEvent>;
}

export interface ConnectPointDrawerProps {
	type: ConnectPointType;
	x: number;
	y: number;
	highlight?: boolean;
	onMouseDown?: (event: ConnectPointDrawerEvent) => void;
	onMouseUp?: (event: ConnectPointDrawerEvent) => void;
	onMouseOver?: (event: ConnectPointDrawerEvent) => void;
	onMouseOut?: (event: ConnectPointDrawerEvent) => void;
}

export const ConnectPointDrawer = ({
	type,
	x,
	y,
	highlight,
	onMouseDown,
	onMouseUp,
	onMouseOver,
	onMouseOut,
}: ConnectPointDrawerProps) => {
	const connectPointElementTheme = useConnectPointTheme({ highlight });
	const [circleRef, setCircleRef] = useState<Konva.Circle | null>(null);
	const [animations, setAnimations] = useState<ConnectPointAnimation | null>(null);

	const handleMouseOver = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		onMouseOver?.({ type, x, y, animations, originalEvent: e });
	};

	const handleMouseOut = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		onMouseOut?.({ type, x, y, animations, originalEvent: e });
	};

	const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		onMouseDown?.({ type, x, y, animations, originalEvent: e });
	};

	const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		onMouseUp?.({ type, x, y, animations, originalEvent: e });
	};

	useEffect(() => {
		if (!circleRef) {
			return;
		}

		setAnimations({
			snapConnectPoint: snapConnectPointAnimation(circleRef),
		});

		return () => {
			if (animations) {
				Object.values(animations).forEach((animation: Animation) => animation.destroy());
			}
		};
	}, [circleRef]);

	return (
		<Circle
			{...connectPointElementTheme}
			ref={(node) => setCircleRef(node)}
			x={x}
			y={y}
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
			onMouseOver={handleMouseOver}
			onMouseOut={handleMouseOut}
		/>
	);
};
