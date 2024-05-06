import { v1 } from 'uuid';
import { ElementGroup, ElementType } from '@maklja/vision-simulator-model';

export class UnsupportedElementTypeError extends Error {
	readonly id = v1();

	constructor(
		readonly elementId: string,
		readonly elementType: ElementType,
		readonly elementGroup: ElementGroup,
	) {
		super(`Unsupported element type "${elementGroup}" in element group "${elementGroup}"`);
	}
}
