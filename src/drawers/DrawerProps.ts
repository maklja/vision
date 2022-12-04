import Konva from 'konva';
import { Key } from 'react';
import { TweenAnimationInstanceConfig } from '../animation';
import { ConnectPointType } from '../model';
import { ThemeContext } from '../theme';
import { ConnectPointAnimations, ConnectPointsDrawerEvent } from './connectPoints';

export interface DrawerEvent {
	id: string;
	originalEvent?: Konva.KonvaEventObject<MouseEvent>;
}

export interface DrawerAnimationEvent {
	id: string;
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

export interface DrawerConnectPointsProps {
	visibleConnectionPoints?: boolean;
	highlightedConnectPoints?: ConnectPointType[];
	connectPointAnimations?: ConnectPointAnimations;
	onConnectPointMouseDown?: (cEvent: ConnectPointsDrawerEvent) => void;
	onConnectPointMouseUp?: (cEvent: ConnectPointsDrawerEvent) => void;
	onConnectPointMouseOver?: (cEvent: ConnectPointsDrawerEvent) => void;
	onConnectPointMouseOut?: (cEvent: ConnectPointsDrawerEvent) => void;
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

export interface DrawerProps extends DrawerCommonProps, DrawerEvents, DrawerConnectPointsProps {}
