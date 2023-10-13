export enum ElementType {
	// creation operators
	Of = 'of',
	From = 'from',
	IIf = 'iif',
	Interval = 'interval',
	Ajax = 'ajax',
	Empty = 'empty',
	Defer = 'defer',
	Generate = 'generate',
	Range = 'range',
	ThrowError = 'throwError',
	Timer = 'timer',
	// join creation operators
	CombineLatest = 'combineLatest',
	Merge = 'merge',
	Concat = 'concat',
	ForkJoin = 'forkJoin',
	Race = 'race',
	Zip = 'zip',
	// other
	Filter = 'filter',
	Subscriber = 'subscriber',
	CatchError = 'catchError',
	Result = 'result',
	ConnectPoint = 'connectPoint',
	Map = 'map',
	ConcatMap = 'concatMap',
	MergeMap = 'mergeMap',
}

export const joinCreationOperators: ReadonlySet<ElementType> = new Set([
	ElementType.Merge,
	ElementType.CombineLatest,
	ElementType.Concat,
	ElementType.ForkJoin,
	ElementType.Race,
	ElementType.Zip,
]);

export const creationOperators: ReadonlySet<ElementType> = new Set([
	ElementType.Of,
	ElementType.From,
	ElementType.Interval,
	ElementType.IIf,
	ElementType.Ajax,
	ElementType.Empty,
	ElementType.Defer,
	ElementType.Generate,
	ElementType.Range,
	ElementType.ThrowError,
	ElementType.Timer,
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
	ElementType.Defer,
	ElementType.From,
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

