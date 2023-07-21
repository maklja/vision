import Konva from 'konva';
import { Key } from 'react';
import { DrawerAnimationTemplate } from '../animation';
import { CircleShape, RectangleShape, Theme } from '../theme';

export interface DrawerEvent {
	id: string;
	originalEvent?: Konva.KonvaEventObject<MouseEvent>;
}

export interface DrawerAnimationEvent {
	drawerId: string;
	animationId: string;
	simulationId?: string;
}

export interface DrawerAnimationEvents {
	onAnimationBegin?: (aEvent: DrawerAnimationEvent) => void;
	onAnimationComplete?: (aEvent: DrawerAnimationEvent) => void;
	onAnimationDestroy?: (aEvent: DrawerAnimationEvent) => void;
}

export interface DrawerEvents extends DrawerAnimationEvents {
	onMouseDown?: (event: DrawerEvent) => void;
	onMouseOver?: (event: DrawerEvent) => void;
	onMouseOut?: (event: DrawerEvent) => void;
	onDragStart?: (event: DrawerEvent) => void;
	onDragEnd?: (event: DrawerEvent) => void;
	onDragMove?: (event: DrawerEvent) => void;
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
	animation?: DrawerAnimationTemplate | null;
}

export interface CircleDrawerProps extends DrawerCommonProps, DrawerEvents {
	size: CircleShape;
}

export interface RectangleDrawerProps extends DrawerCommonProps, DrawerEvents {
	size: RectangleShape;
}

export type DrawerProps = CircleDrawerProps | RectangleDrawerProps;

