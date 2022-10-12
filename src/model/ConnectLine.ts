import Konva from 'konva';

export interface ConnectLine {
	sourceId: string;
	targetId: string;
	points: Konva.Vector2d[];
}

