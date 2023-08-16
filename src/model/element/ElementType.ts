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
	ConnectPoint = 'connectPoint',
	Map = 'map',
	ConcatMap = 'concatMap',
	MergeMap = 'mergeMap',
	Ajax = 'ajax',
	Empty = 'empty',
}

export const joinCreationOperators: ReadonlySet<ElementType> = new Set([ElementType.Merge]);

export const creationOperators: ReadonlySet<ElementType> = new Set([
	ElementType.Of,
	ElementType.From,
	ElementType.Interval,
	ElementType.IIf,
	ElementType.Ajax,
	ElementType.Empty,
]);

export const transformationOperators: ReadonlySet<ElementType> = new Set([
	ElementType.Map,
	ElementType.ConcatMap,
	ElementType.MergeMap,
]);

export const filteringOperators: ReadonlySet<ElementType> = new Set([ElementType.Filter]);

export const errorHandlerOperators: ReadonlySet<ElementType> = new Set([ElementType.CatchError]);

export const pipeOperators: ReadonlySet<ElementType> = new Set([
	...transformationOperators,
	...filteringOperators,
	...errorHandlerOperators,
]);

export const eventPipeOperators: ReadonlySet<ElementType> = new Set([
	...errorHandlerOperators,
	ElementType.IIf,
	ElementType.ConcatMap,
	ElementType.MergeMap,
]);

export const subscriberOperators: ReadonlySet<ElementType> = new Set([ElementType.Subscriber]);

export const resultOperators: ReadonlySet<ElementType> = new Set([ElementType.Result]);

export const connectPointOperators: ReadonlySet<ElementType> = new Set([ElementType.ConnectPoint]);

export const isJoinCreationOperatorType = (type: ElementType) => joinCreationOperators.has(type);

export const isCreationOperatorType = (type: ElementType) => creationOperators.has(type);

export const isPipeOperatorType = (type: ElementType) => pipeOperators.has(type);

export const isEventPipeOperatorType = (type: ElementType) => eventPipeOperators.has(type);

export const isSubscriberType = (type: ElementType) => subscriberOperators.has(type);

export const isErrorHandlerType = (type: ElementType) => errorHandlerOperators.has(type);

export const isResultOperatorType = (type: ElementType) => resultOperators.has(type);

export const isConnectPointType = (type: ElementType) => connectPointOperators.has(type);

export const isEntryOperatorType = (type: ElementType) =>
	isCreationOperatorType(type) || isJoinCreationOperatorType(type);
