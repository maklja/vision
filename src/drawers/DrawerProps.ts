import Konva from 'konva';
import { Key } from 'react';
import { Animation } from '../animation';
import { ConnectPointType } from '../model';
import { ThemeContext } from '../theme';
import { ConnectPointsDrawerEvent } from './connectPoints';

export interface DrawerAnimations {
	highlight: Animation | null;
	error: Animation | null;
}

export interface DrawerEvent {
	id: string;
	animations?: DrawerAnimations;
	originalEvent?: Konva.KonvaEventObject<MouseEvent>;
}

export interface DrawerEvents {
	onMouseDown?: (event: DrawerEvent) => void;
	onMouseOver?: (event: DrawerEvent) => void;
	onMouseOut?: (event: DrawerEvent) => void;
	onDragStart?: (event: DrawerEvent) => void;
	onDragEnd?: (event: DrawerEvent) => void;
	onDragMove?: (event: DrawerEvent) => void;
	onAnimationReady?: (event: DrawerEvent) => void;
	onAnimationDestroy?: (event: DrawerEvent) => void;
}

export interface DrawerConnectPointsProps {
	visibleConnectionPoints?: boolean;
	highlightedConnectPoints?: ConnectPointType[];
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
}

export interface DrawerProps extends DrawerCommonProps, DrawerEvents, DrawerConnectPointsProps {}

