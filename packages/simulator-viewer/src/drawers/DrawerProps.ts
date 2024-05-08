import { Key, ReactNode } from 'react';
import Konva from 'konva';
import { Node } from 'konva/lib/Node';
import {
	BoundingBox,
	ConnectPointPosition,
	ConnectPointType,
	ConnectPoint,
	Point,
} from '@maklja/vision-simulator-model';
import { DrawerAnimationTemplate, AnimationEffectEvent } from '../animation';
import { CircleShapeSize, RectangleShapeSize, ShapeSize, Theme } from '../theme';

export interface DrawerEvent {
	id: string;
	originalEvent?: Konva.KonvaEventObject<MouseEvent>;
}

export interface DrawerDragBoundEvent {
	id: string;
	node: Node;
	position: Point;
}

export interface DrawerAnimationEvents {
	onAnimationBegin?: (aEvent: AnimationEffectEvent) => void;
	onAnimationComplete?: (aEvent: AnimationEffectEvent) => void;
	onAnimationDestroy?: (aEvent: AnimationEffectEvent) => void;
}

export interface DrawerEvents extends DrawerAnimationEvents {
	onMouseDown?: (event: DrawerEvent) => void;
	onMouseUp?: (event: DrawerEvent) => void;
	onMouseOver?: (event: DrawerEvent) => void;
	onMouseOut?: (event: DrawerEvent) => void;
	onDragStart?: (event: DrawerEvent) => void;
	onDragEnd?: (event: DrawerEvent) => void;
	onDragMove?: (event: DrawerEvent) => void;
	onDragBound?: (event: DrawerDragBoundEvent) => Point;
}

export interface DrawerCommonProps {
	key?: Key;
	id: string;
	theme: Theme;
	x: number;
	y: number;
	draggable?: boolean;
	highlight?: boolean;
	select?: boolean;
	visible?: boolean;
	disabled?: boolean;
	hasError?: boolean;
	animation?: DrawerAnimationTemplate | null;
}

export interface CircleDrawerProps extends DrawerCommonProps, DrawerEvents {
	size: CircleShapeSize;
}

export interface RectangleDrawerProps extends DrawerCommonProps, DrawerEvents {
	size: RectangleShapeSize;
}

export type DrawerProps = CircleDrawerProps | RectangleDrawerProps;

export interface ConnectPointIconDrawerProps {
	connectPointPosition: ConnectPointPosition;
	type: ConnectPointType;
	theme: Theme;
	highlight?: boolean;
}

export interface ConnectPointDrawerEvent {
	id: string;
	type: ConnectPointType;
	position: ConnectPointPosition;
	boundingBox: BoundingBox;
	originalEvent: Konva.KonvaEventObject<MouseEvent>;
	animation?: DrawerAnimationTemplate | null;
}

export type ConnectPointsOptions<T extends ShapeSize> = {
	[key in ConnectPointPosition]?: ConnectPoint & {
		shapeSize: T;
		animation?: DrawerAnimationTemplate | null;
		icon?: (props: ConnectPointIconDrawerProps) => ReactNode;
	};
};

export interface ConnectPointsDrawerEvent {
	id: string;
	connectPoint: ConnectPointDrawerEvent;
	element: BoundingBox;
}

export interface ConnectPointsDrawerEvents extends DrawerAnimationEvents {
	onMouseDown?: (cEvent: ConnectPointsDrawerEvent) => void;
	onMouseUp?: (cEvent: ConnectPointsDrawerEvent) => void;
	onMouseOver?: (cEvent: ConnectPointsDrawerEvent) => void;
	onMouseOut?: (cEvent: ConnectPointsDrawerEvent) => void;
	onMouseMove?: (cEvent: ConnectPointsDrawerEvent) => void;
}

export interface LineEvent<E = MouseEvent> {
	id: string;
	originalEvent?: Konva.KonvaEventObject<E>;
}

export interface LineDotEvent<E = MouseEvent> extends LineEvent<E> {
	index: number;
}

export interface LineDrawerEvents {
	onMouseDown?: (lineEvent: LineEvent) => void;
	onMouseUp?: (lineEvent: LineEvent) => void;
	onMouseOver?: (lineEvent: LineEvent) => void;
	onMouseOut?: (lineEvent: LineEvent) => void;
	onDotMouseDown?: (lineDotEvent: LineDotEvent) => void;
	onDotMouseOver?: (lineDotEvent: LineDotEvent) => void;
	onDotMouseOut?: (lineDotEvent: LineDotEvent) => void;
	onDotDragStart?: (lineDotEvent: LineDotEvent<DragEvent>) => void;
	onDotDragEnd?: (lineDotEvent: LineDotEvent<DragEvent>) => void;
	onDotDragMove?: (lineDotEvent: LineDotEvent<DragEvent>) => void;
}

export const createConnectPointDrawerId = (
	drawerId: string,
	connectPointPosition: ConnectPointPosition,
) => `${drawerId}_${connectPointPosition}`;

