import { ConnectPointPosition } from './ConnectPointPosition';
import { ConnectPointType } from './ConnectPointType';

export interface ConnectPoint {
	type: ConnectPointType;
	position: ConnectPointPosition;
	elementId: string;
}

export interface ConnectPointX {
	type: ConnectPointType;
	position: ConnectPointPosition;
	elementId: string;
	x: number;
	y: number;
	visible: boolean;
}

