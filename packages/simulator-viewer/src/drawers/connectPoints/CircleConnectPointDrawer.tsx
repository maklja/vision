import { ReactNode } from 'react';
import Konva from 'konva';
import { useState } from 'react';
import { Circle, Group } from 'react-konva';
import { ConnectPointPosition, ConnectPointType } from '@maklja/vision-simulator-model';
import { DrawerAnimationTemplate, useAnimation } from '../../animation';
import {
	CircleShapeSize,
	Theme,
	calculateShapeSizeBoundingBox,
	useConnectPointTheme,
} from '../../theme';
import {
	ConnectPointDrawerEvent,
	ConnectPointIconDrawerProps,
	DrawerAnimationEvents,
} from '../DrawerProps';

export interface CircleConnectPointDrawerProps extends DrawerAnimationEvents {
	id: string;
	type: ConnectPointType;
	position: ConnectPointPosition;
	x: number;
	y: number;
	theme: Theme;
	size: CircleShapeSize;
	highlight?: boolean;
	animation?: DrawerAnimationTemplate | null;
	onMouseDown?: (event: ConnectPointDrawerEvent) => void;
	onMouseUp?: (event: ConnectPointDrawerEvent) => void;
	onMouseOver?: (event: ConnectPointDrawerEvent) => void;
	onMouseOut?: (event: ConnectPointDrawerEvent) => void;
	onMouseMove?: (event: ConnectPointDrawerEvent) => void;
	children?: (iconProps: ConnectPointIconDrawerProps) => ReactNode | null;
}

export function CircleConnectPointDrawer({
	id,
	type,
	position,
	x,
	y,
	highlight,
	animation,
	theme,
	size,
	children,
	onMouseDown,
	onMouseUp,
	onMouseOver,
	onMouseOut,
	onMouseMove,
	onAnimationBegin,
	onAnimationComplete,
	onAnimationDestroy,
}: CircleConnectPointDrawerProps) {
	const connectPointElementTheme = useConnectPointTheme(theme, { position, highlight });
	const { radius } = size;
	const boundingBox = calculateShapeSizeBoundingBox({ x, y }, size);
	const [mainShapeRef, setMainShapeRef] = useState<Konva.Circle | null>(null);

	useAnimation(mainShapeRef, {
		animationTemplate: animation,
		mapper: (a) => ({
			config: a.mainShape,
		}),
		onAnimationBegin,
		onAnimationComplete,
		onAnimationDestroy,
		drawerId: id,
	});

	const handleMouseOver = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onMouseOver?.({ id, type, position, boundingBox, animation, originalEvent: e });

	const handleMouseOut = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onMouseOut?.({ id, type, position, boundingBox, animation, originalEvent: e });

	const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onMouseDown?.({ id, type, position, boundingBox, animation, originalEvent: e });

	const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onMouseUp?.({ id, type, position, boundingBox, animation, originalEvent: e });

	const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onMouseMove?.({ id, type, position, boundingBox, animation, originalEvent: e });

	return (
		<Group x={x} y={y} visible={Boolean(mainShapeRef)}>
			<Circle
				{...connectPointElementTheme.element}
				x={radius}
				y={radius}
				radius={radius}
				ref={(node) => setMainShapeRef(node)}
				onMouseDown={handleMouseDown}
				onMouseUp={handleMouseUp}
				onMouseOver={handleMouseOver}
				onMouseOut={handleMouseOut}
				onMouseMove={handleMouseMove}
			/>
			{children?.({ type, theme, highlight, connectPointPosition: position })}
		</Group>
	);
}

