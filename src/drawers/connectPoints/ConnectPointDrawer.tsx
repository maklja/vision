import Konva from 'konva';
import { useState } from 'react';
import { Circle } from 'react-konva';
import { TweenAnimationInstanceConfig, useAnimation, useAnimationEffect } from '../../animation';
import { ConnectPointType } from '../../model';
import { ThemeContext, useConnectPointTheme } from '../../theme';
import { DrawerAnimationEvents } from '../DrawerProps';

export interface ConnectPointDrawerEvent {
	id: string;
	type: ConnectPointType;
	x: number;
	y: number;
	originalEvent: Konva.KonvaEventObject<MouseEvent>;
	animation?: TweenAnimationInstanceConfig | null;
}

export interface ConnectPointDrawerProps extends DrawerAnimationEvents {
	id: string;
	type: ConnectPointType;
	x: number;
	y: number;
	theme: ThemeContext;
	highlight?: boolean;
	animation?: TweenAnimationInstanceConfig | null;
	onMouseDown?: (event: ConnectPointDrawerEvent) => void;
	onMouseUp?: (event: ConnectPointDrawerEvent) => void;
	onMouseOver?: (event: ConnectPointDrawerEvent) => void;
	onMouseOut?: (event: ConnectPointDrawerEvent) => void;
}

export const ConnectPointDrawer = ({
	id,
	type,
	x,
	y,
	highlight,
	animation,
	theme,
	onMouseDown,
	onMouseUp,
	onMouseOver,
	onMouseOut,
	onAnimationBegin,
	onAnimationComplete,
	onAnimationDestroy,
}: ConnectPointDrawerProps) => {
	const connectPointElementTheme = useConnectPointTheme({ highlight }, theme);
	const [mainShapeRef, setMainShapeRef] = useState<Konva.Circle | null>(null);
	const mainShapeAnimation = useAnimation(mainShapeRef, animation, (a) => ({
		config: a.mainShape,
		options: a.options,
	}));

	const handleMouseOver = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		onMouseOver?.({ id, type, x, y, animation, originalEvent: e });
	};

	const handleMouseOut = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		onMouseOut?.({ id, type, x, y, animation, originalEvent: e });
	};

	const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		onMouseDown?.({ id, type, x, y, animation, originalEvent: e });
	};

	const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		onMouseUp?.({ id, type, x, y, animation, originalEvent: e });
	};

	useAnimationEffect(mainShapeAnimation, {
		onAnimationBegin,
		onAnimationComplete,
		onAnimationDestroy,
		simulationId: animation?.simulationId,
		drawerId: id,
	});

	return (
		<Circle
			{...connectPointElementTheme}
			ref={(node) => setMainShapeRef(node)}
			x={x}
			y={y}
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
			onMouseOver={handleMouseOver}
			onMouseOut={handleMouseOut}
		/>
	);
};
