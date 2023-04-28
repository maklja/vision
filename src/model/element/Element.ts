import { ElementType } from './ElementType';

// TODO to new file
interface ConnectPointDescriptor {
	allowedTypes: ElementType[];
	cardinality: number;
}

interface ConnectPoints {
	input?: ConnectPointDescriptor;
	output?: ConnectPointDescriptor;
	event?: ConnectPointDescriptor;
}

export interface Element<P extends unknown | Record<string, unknown> = unknown> {
	id: string;
	type: ElementType;
	x: number;
	y: number;
	size: number;
	visible: boolean;
	properties: P;
	connectPoints: ConnectPoints;
}

