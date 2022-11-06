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
	highlight: Animation;
}

export interface DrawerProps {
	id: string;
	x?: number;
	y?: number;
	size?: number;
	onMouseDown?: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseOver?: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseOut?: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onDragStart?: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onDragEnd?: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onDragMove?: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onAnimationReady?: (id: string, animations: DrawerAnimations) => void;
	onAnimationDestroy?: (id: string) => void;
}
