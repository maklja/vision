import { v1 } from 'uuid';

export class InvalidElementPropertyValueError extends Error {
	readonly id = v1();

	constructor(readonly elementId: string, readonly propertyKey: string) {
		super(`Invalid property "${propertyKey}" value for element ${elementId}`);
	}
}

