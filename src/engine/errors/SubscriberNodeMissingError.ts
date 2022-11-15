export class SubscriberNodeMissingError extends Error {
	constructor() {
		super(`Subscriber element was not found.`);
	}
}
