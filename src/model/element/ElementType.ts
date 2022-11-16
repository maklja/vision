export enum ElementType {
	Of = 'of',
	From = 'from',
	Interval = 'interval',
	Filter = 'filter',
	Subscriber = 'subscriber',
}

export const creationOperators: readonly ElementType[] = [
	ElementType.Of,
	ElementType.From,
	ElementType.Interval,
];

export const filterOperators: readonly ElementType[] = [ElementType.Filter];

export const pipeOperators: readonly ElementType[] = [...filterOperators];

export const subscriberOperators: readonly ElementType[] = [ElementType.Subscriber];

export const isCreationOperatorType = (type: ElementType) => creationOperators.includes(type);

export const isPipeOperatorType = (type: ElementType) => pipeOperators.includes(type);

export const isSubscriberType = (type: ElementType) => type === ElementType.Subscriber;

