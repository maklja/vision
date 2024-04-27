import { ConnectPointPosition } from './ConnectPointPosition';
import { ConnectPointType } from './ConnectPointType';

export interface ConnectPoint {
	type: ConnectPointType;
	position: ConnectPointPosition;
	elementId: string;
	x: number;
	y: number;
	visible: boolean;
	highlight: boolean;
}

export type ConnectPoints = {
	[key in ConnectPointPosition]?: ConnectPoint;
};

