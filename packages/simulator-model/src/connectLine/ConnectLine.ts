import { Point } from '../common';
import { ConnectPointPosition, ConnectPointType } from '../connectPoint';

export enum ConnectLineType {
	Pipe = 'pipe',
	Subscribe = 'subscribe',
}

export interface ConnectedElement {
	id: string;
	connectPointType: ConnectPointType;
	connectPosition: ConnectPointPosition;
}

export interface ConnectLine {
	id: string;
	type: ConnectLineType;
	source: ConnectedElement;
	target: ConnectedElement;
	points: Point[];
	locked: boolean;
	index: number;
	name: string;
}

