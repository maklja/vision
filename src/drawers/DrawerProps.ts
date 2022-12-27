import Konva from 'konva';
import { Key } from 'react';
import { TweenAnimationInstanceConfig } from '../animation';
import { ThemeContext } from '../theme';

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
	theme: ThemeContext;
	x: number;
	y: number;
	size: number;
	highlight?: boolean;
	select?: boolean;
	animation?: TweenAnimationInstanceConfig | null;
}

export interface DrawerProps extends DrawerCommonProps, DrawerEvents {}
