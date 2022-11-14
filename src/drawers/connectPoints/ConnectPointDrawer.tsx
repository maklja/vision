import Konva from 'konva';
import { useState } from 'react';
import { Circle } from 'react-konva';
import { Animation, useAnimation } from '../../animation';
import { ConnectPointType } from '../../model';
import { ThemeContext, useConnectPointTheme } from '../../theme';
import { snapConnectPointAnimation } from './animation/snapConnectPointAnimation';

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
	theme: ThemeContext;
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
	theme,
	onMouseDown,
	onMouseUp,
	onMouseOver,
	onMouseOut,
}: ConnectPointDrawerProps) => {
	const connectPointElementTheme = useConnectPointTheme({ highlight }, theme);
	const [circleRef, setCircleRef] = useState<Konva.Circle | null>(null);
	const snapConnectPointAnimationRef = useAnimation(
		circleRef,
		(node) => snapConnectPointAnimation(node, theme),
		[theme],
	);

	const createAnimations = (): ConnectPointAnimation | null => {
		if (!snapConnectPointAnimationRef) {
			return null;
		}

		return {
			snapConnectPoint: snapConnectPointAnimationRef,
		};
	};

	const handleMouseOver = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		onMouseOver?.({ type, x, y, animations: createAnimations(), originalEvent: e });
	};

	const handleMouseOut = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		onMouseOut?.({ type, x, y, animations: createAnimations(), originalEvent: e });
	};

	const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		onMouseDown?.({ type, x, y, animations: createAnimations(), originalEvent: e });
	};

	const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		onMouseUp?.({ type, x, y, animations: createAnimations(), originalEvent: e });
	};

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

