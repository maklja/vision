export enum ElementType {
	Merge = 'merge',
	Of = 'of',
	From = 'from',
	IIf = 'iif',
	Interval = 'interval',
	Filter = 'filter',
	Subscriber = 'subscriber',
	CatchError = 'catchError',
	Result = 'result',
}

export const joinCreationOperators: ReadonlySet<ElementType> = new Set([ElementType.Merge]);

export const creationOperators: ReadonlySet<ElementType> = new Set([
	ElementType.Of,
	ElementType.From,
	ElementType.Interval,
	ElementType.IIf,
]);

export const filterOperators: ReadonlySet<ElementType> = new Set([ElementType.Filter]);

export const errorHandlerOperators: ReadonlySet<ElementType> = new Set([ElementType.CatchError]);

export const pipeOperators: ReadonlySet<ElementType> = new Set([
	...filterOperators,
	...errorHandlerOperators,
]);

export const eventPipeOperators: ReadonlySet<ElementType> = new Set([
	...errorHandlerOperators,
	ElementType.IIf,
]);

export const subscriberOperators: ReadonlySet<ElementType> = new Set([ElementType.Subscriber]);

export const isJoinCreationOperatorType = (type: ElementType) => joinCreationOperators.has(type);

export const isCreationOperatorType = (type: ElementType) => creationOperators.has(type);

export const isPipeOperatorType = (type: ElementType) => pipeOperators.has(type);

export const isEventPipeOperatorType = (type: ElementType) => eventPipeOperators.has(type);

export const isSubscriberType = (type: ElementType) => subscriberOperators.has(type);

export const isErrorHandlerType = (type: ElementType) => errorHandlerOperators.has(type);

export const isEntryOperatorType = (type: ElementType) =>
	isCreationOperatorType(type) || isJoinCreationOperatorType(type);
