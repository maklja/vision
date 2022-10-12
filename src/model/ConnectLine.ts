import Konva from 'konva';
import { ConnectionPoint } from './ConnectionPoint';

export interface ConnectPoint {
	id: string;
	point: ConnectionPoint;
	x: number;
	y: number;
}

export interface ConnectLine {
	source: ConnectPoint;
	target: ConnectPoint;
	points: Konva.Vector2d[];
}
