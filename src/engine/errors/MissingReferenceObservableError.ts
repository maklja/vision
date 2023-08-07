import { v1 } from 'uuid';

export class MissingReferenceObservableError extends Error {
	readonly id = v1();

	constructor(public readonly elementId: string, readonly message: string) {
		super(message ?? `Reference observable missing for element id ${elementId}`);
	}
}
