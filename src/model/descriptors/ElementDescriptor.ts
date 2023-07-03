import { ElementType } from '../element';

export interface ConnectPointDescriptor {
	allowedTypes: Set<ElementType>;
	cardinality: number;
}

export interface ElementDescriptor {
	input?: ConnectPointDescriptor;
	output?: ConnectPointDescriptor;
	event?: ConnectPointDescriptor;
}

