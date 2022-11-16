export class AnimationDestroyedError extends Error {
	constructor(public readonly animationId: string) {
		super(`Animation with id ${animationId} was destroyed`);
	}
}

