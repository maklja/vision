export enum ElementType {
	Of = 'of',
	From = 'from',
	Interval = 'interval',
	Filter = 'filter',
	Subscriber = 'subscriber',
	CatchError = 'catchError',
	Result = 'result',
}

export const creationOperators: readonly ElementType[] = [
	ElementType.Of,
	ElementType.From,
	ElementType.Interval,
];

export const filterOperators: readonly ElementType[] = [ElementType.Filter];

export const errorHandlerOperators: readonly ElementType[] = [ElementType.CatchError];

export const pipeOperators: readonly ElementType[] = [...filterOperators, ...errorHandlerOperators];

export const subscriberOperators: readonly ElementType[] = [ElementType.Subscriber];

export const isCreationOperatorType = (type: ElementType) => creationOperators.includes(type);

export const isPipeOperatorType = (type: ElementType) => pipeOperators.includes(type);

export const isSubscriberType = (type: ElementType) => type === ElementType.Subscriber;

export const isErrorHandlerType = (type: ElementType) => errorHandlerOperators.includes(type);
