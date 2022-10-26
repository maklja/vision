import Konva from 'konva';

export interface ConnectLine {
	id: string;
	sourceId: string;
	targetId: string | null;
	points: Konva.Vector2d[];
	locked: boolean;
}

