export class CreationNodeMissingError extends Error {
	constructor(public readonly elementId: string) {
		super(`Creation element with id ${elementId} was not found.`);
	}
}

