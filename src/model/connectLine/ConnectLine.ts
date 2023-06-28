import { Point } from '../common';
import { ConnectPointPosition, ConnectPointType } from '../connectPoint';

export interface ConnectedElement {
	id: string;
	connectPointType: ConnectPointType;
	connectPosition: ConnectPointPosition;
}

export interface ConnectLine {
	id: string;
	source: ConnectedElement;
	target: ConnectedElement;
	points: Point[];
	locked: boolean;
}

