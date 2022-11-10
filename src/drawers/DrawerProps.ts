import Konva from 'konva';
import { Animation } from '../animation';

export interface DrawerConnectPointsProps {
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface DrawerAnimations {
	highlight: Animation | null;
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

export interface DrawerProps extends DrawerEvents {
	id: string;
	x?: number;
	y?: number;
	size?: number;
}
