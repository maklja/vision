import { v1 } from 'uuid';

export class MissingNextElementError extends Error {
	readonly id = v1();

	constructor(public readonly elementId: string, message?: string) {
		super(message ?? `Missing next element after element ${elementId}`);
	}
}

