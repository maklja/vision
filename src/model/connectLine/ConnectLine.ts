import { Point } from '../common';

export interface ConnectLine {
	id: string;
	sourceId: string;
	targetId: string;
	points: Point[];
	locked: boolean;
}
