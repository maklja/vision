import Konva from 'konva';

export interface ElementProps {
	id: string;
	x?: number;
	y?: number;
	size?: number;
	selected?: boolean;
	highlighted?: boolean;
	dragging?: boolean;
	onMouseDown?: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseOver?: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onMouseOut?: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onDragStart?: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onDragEnd?: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => void;
	onDragMove?: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => void;
}

