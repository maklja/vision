import { v1 } from 'uuid';

export class MissingReferenceObservableError extends Error {
	readonly id = v1();

	constructor(readonly elementId: string, message?: string) {
		super(message ?? `Reference observable missing for element id ${elementId}`);
	}
}

