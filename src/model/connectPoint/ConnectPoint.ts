import { ConnectPointPosition } from './ConnectPointPosition';
import { ConnectPointType } from './ConnectPointType';

export interface ConnectPoint {
	type: ConnectPointType;
	position: ConnectPointPosition;
	elementId: string;
}

