import {
	AjaxElementProperties,
	ajaxElementPropsTemplate,
	HttpMethod,
} from '../creationOperators/AjaxElement';
import {
	FilterElementProperties,
	filterElementPropsTemplate,
} from '../filterOperators/FilterElement';
import {
	CatchErrorElementProperties,
	catchErrorElementPropsTemplate,
} from '../errorHandlerOperators/CatchErrorElement';
import {
	ForkJoinElementProperties,
	forkJoinElementPropsTemplate,
} from '../joinCreationOperators/ForkJoinElement';
import {
	CombineLatestElementProperties,
	combineLatestElementPropsTemplate,
} from '../joinCreationOperators/CombineLatestElement';
import {
	BufferWhenElementProperties,
	bufferWhenElementPropsTemplate,
} from '../transformationOperators/BufferWhenElement';
import {
	BufferToggleElementProperties,
	bufferToggleElementPropsTemplate,
} from '../transformationOperators/BufferToggleElement';
import {
	BufferTimeElementProperties,
	bufferTimeElementPropsTemplate,
} from '../transformationOperators/BufferTimeElement';
import {
	BufferCountElementProperties,
	bufferCountElementPropsTemplate,
} from '../transformationOperators/BufferCountElement';
import {
	MergeMapElementProperties,
	mergeMapElementPropsTemplate,
} from '../transformationOperators/MergeMapElement';
import {
	ExpandElementProperties,
	expandElementPropsTemplate,
} from '../transformationOperators/ExpandElement';
import {
	ExhaustMapElementProperties,
	exhaustMapElementPropsTemplate,
} from '../transformationOperators/ExhaustMapElement';
import {
	ConcatMapElementProperties,
	concatMapElementPropsTemplate,
} from '../transformationOperators/ConcatMapElement';
import { OBSERVABLE_GENERATOR_NAME } from '../common';
import { IifElementProperties, iifElementPropsTemplate } from '../creationOperators/IifElement';
import {
	DeferElementProperties,
	deferElementPropsTemplate,
} from '../creationOperators/DeferElement';
import { FromElementProperties, fromElementPropsTemplate } from '../creationOperators/FromElement';
import {
	IntervalElementProperties,
	intervalElementPropsTemplate,
} from '../creationOperators/IntervalElement';
import {
	RangeElementProperties,
	rangeElementPropsTemplate,
} from '../creationOperators/RangeElement';
import {
	DueDateType,
	TimerElementProperties,
	timerElementPropsTemplate,
} from '../creationOperators/TimerElement';
import {
	GenerateElementProperties,
	generateElementPropsTemplate,
} from '../creationOperators/GenerateElement';
import {
	ThrowErrorElementProperties,
	throwErrorElementPropsTemplate,
} from '../creationOperators/ThrowErrorElement';
import { OfElementProperties, ofElementPropsTemplate } from '../creationOperators/OfElement';
import {
	subscriberElementDescriptor,
	creationElementDescriptor,
	iifElementDescriptor,
	deferElementDescriptor,
	fromElementDescriptor,
	findFromElementDescriptor,
	joinCreationElementDescriptor,
	pipeElementDescriptor,
	eventPipeElementDescriptor,
	bufferToggleElementDescriptor,
} from '../descriptors/elementDescriptors';
import { CommonProps, ElementProps, ObservableInputsType } from '../element/Element';
import { ElementGroup } from '../element/ElementGroup';
import { ElementType } from '../element/ElementType';
import {
	MergeElementProperties,
	mergeElementPropsTemplate,
} from '../joinCreationOperators/MergeElement';
import {
	MapElementProperties,
	mapElementPropsTemplate,
} from '../transformationOperators/MapElement';
import type { OperatorDefinition } from './OperatorDefinition';

const codeExport = {
	status: 'deferred',
	reason: 'Readable RxJS serializers are tracked in #136.',
} as const;

export const ajaxOperatorDefinition = {
	type: ElementType.Ajax,
	name: 'ajax',
	category: ElementGroup.Creation,
	documentationUrl: 'https://rxjs.dev/api/ajax/ajax',
	status: 'supported',
	defaults: ajaxElementPropsTemplate,
	properties: {
		url: {
			kind: 'text',
			label: 'Url',
			semantics:
				'Literal request URL; never evaluated as JavaScript. Forwarded after invocation overrides.',
		},
		method: {
			kind: 'choice',
			label: 'Method',
			options: Object.values(HttpMethod).map((value) => ({ value, label: value })),
			semantics: 'HTTP method forwarded unchanged to RxJS Ajax.',
		},
		body: {
			kind: 'text',
			optional: true,
			label: 'Body',
			format: 'json',
			semantics:
				'Truthy text is parsed with JSON.parse on each actual subscription after overrides. JSON primitives are accepted. Empty or omitted text supplies undefined; invalid JSON throws InvalidElementPropertyValueError for body before Ajax is called.',
		},
		headers: {
			kind: 'pairs',
			optional: true,
			label: 'Headers',
			semantics:
				'Ordered string pairs reduced to an object. The last exact duplicate key wins; metadata does not normalize names.',
		},
		queryParams: {
			kind: 'pairs',
			optional: true,
			label: 'Query parameters',
			semantics:
				'Ordered string pairs grouped by key into strings or arrays. RxJS 7.8 serializes record arrays as comma-separated values through URLSearchParams; these are not repeated wire keys.',
		},
		timeout: {
			kind: 'number',
			optional: true,
			label: 'Timeout',
			semantics:
				'Forwarded unchanged in milliseconds; the form displays zero when absent without adding a stored default.',
		},
		responseType: {
			kind: 'choice',
			optional: true,
			label: 'Response type',
			options: [
				{ value: 'arraybuffer', label: 'Array buffer' },
				{ value: 'blob', label: 'Blob' },
				{ value: 'document', label: 'Document' },
				{ value: 'json', label: 'JSON' },
				{ value: 'text', label: 'Text' },
			],
			semantics:
				'Forwarded unchanged, including an existing empty string. The form offers five response types and displays JSON when absent; this does not add a stored default.',
		},
	},
	ports: creationElementDescriptor,
	referencePorts: ['input'],
	example:
		'Ajax -> Map -> Subscriber: project response.status and response.response. Each complete AjaxResponse is wrapped in a fresh source FlowValue with the supplied subscription ID. Requests begin on subscription; errors remain RxJS errors at the factory boundary.',
	codeExport,
} as const satisfies OperatorDefinition<AjaxElementProperties, never, 'url' | 'body'>;

export const subscriberOperatorDefinition = {
	type: ElementType.Subscriber,
	name: 'subscriber',
	category: ElementGroup.Subscriber,
	documentationUrl: 'https://rxjs.dev/api/index/class/Observable',
	status: 'supported',
	defaults: {},
	properties: {},
	ports: subscriberElementDescriptor,
	referencePorts: [],
	example:
		'Terminal sink with one value input and no output, event reference or property form. The graph terminates here; no RxJS creation or pipe factory is registered.',
	codeExport,
} as const satisfies OperatorDefinition<ElementProps>;

export const emptyOperatorDefinition = {
	type: ElementType.Empty,
	name: 'empty',
	category: ElementGroup.Creation,
	documentationUrl: 'https://rxjs.dev/api/index/const/EMPTY',
	status: 'supported',
	defaults: {},
	properties: {},
	ports: creationElementDescriptor,
	referencePorts: ['input'],
	example:
		'Completes synchronously without emitting. No properties, event reference or property form; unknown invocation override keys are rejected.',
	codeExport,
} as const satisfies OperatorDefinition<ElementProps>;

export const generateOperatorDefinition = {
	type: ElementType.Generate,
	name: 'generate',
	category: ElementGroup.Creation,
	documentationUrl: 'https://rxjs.dev/api/index/function/generate',
	status: 'supported',
	defaults: generateElementPropsTemplate,
	properties: {
		initialState: {
			kind: 'expression',
			label: 'Initial state',
			returns: 'unknown',
			semantics:
				'Evaluated without helpers on each actual source subscription after resolving overrides. The resulting initial state and callback closures are fresh per subscription. Errors enter the observable error channel.',
		},
		condition: {
			kind: 'callback',
			optional: true,
			label: 'Condition',
			signature: {
				arguments: [{ name: 'value', type: 'unknown (state)' }],
				returns: 'unknown (truthy condition)',
				helpers: [],
				notes: 'The callback-producing expression is evaluated on each actual source subscription after overrides; an omitted optional condition omits the RxJS condition. Explicit undefined or empty source is invalid. The returned function receives only the state on subscription before each emission. A falsy result terminates generation. Without a condition, generation continues synchronously until cancellation or an error.',
			},
		},
		iterate: {
			kind: 'callback',
			label: 'Iterate',
			signature: {
				arguments: [{ name: 'value', type: 'unknown (state)' }],
				returns: 'unknown (next state)',
				helpers: [],
				notes: 'The expression is evaluated on each actual source subscription after overrides; its returned function receives only the current state between emissions. No index or helper is supplied; closures are isolated across subscriptions to the returned observable.',
			},
		},
		resultSelector: {
			kind: 'callback',
			label: 'Result selector',
			signature: {
				arguments: [{ name: 'value', type: 'unknown (state)' }],
				returns: 'unknown',
				helpers: [],
				notes: 'The expression is evaluated on each actual source subscription after overrides; its returned function projects each accepted state on subscription. Each raw result becomes a fresh FlowValue with the source element and supplied subscription ID. Callback errors remain RxJS errors at this factory boundary.',
			},
		},
	},
	ports: creationElementDescriptor,
	referencePorts: ['input'],
	example:
		'The saved initialState 0, condition value < 3, iterate value + 1 and resultSelector value * 1000 emit 0, 1000, 2000, then complete.',
	codeExport,
} as const satisfies OperatorDefinition<GenerateElementProperties, 'initialState'>;

export const throwErrorOperatorDefinition = {
	type: ElementType.ThrowError,
	name: 'throwError',
	category: ElementGroup.Creation,
	documentationUrl: 'https://rxjs.dev/api/index/function/throwError',
	status: 'supported',
	defaults: throwErrorElementPropsTemplate,
	properties: {
		errorOrErrorFactory: {
			kind: 'expression',
			label: 'Error factory',
			returns: 'unknown | (() => unknown)',
			semantics:
				'Evaluated without helpers on each actual source subscription after merging overrides. RxJS accepts either an error value or a factory. Expression-construction errors enter the observable error channel. Subscription errors are wrapped in fresh error FlowValues with the element ID and supplied subscription ID.',
			callback: {
				arguments: [],
				returns: 'unknown',
				helpers: [],
				notes: 'If the expression returns a function, RxJS invokes it without arguments on every subscription. The callback closure is shared across subscriptions to the returned observable; errors thrown by the callback are wrapped like returned errors.',
			},
		},
	},
	ports: creationElementDescriptor,
	referencePorts: ['input'],
	example:
		'The saved function creates a new Error("Unexpected error!") for each subscription. A direct new Error("failure") expression also evaluates afresh per subscription.',
	codeExport,
} as const satisfies OperatorDefinition<ThrowErrorElementProperties, 'errorOrErrorFactory'>;

export const ofOperatorDefinition = {
	type: ElementType.Of,
	name: 'of',
	category: ElementGroup.Creation,
	documentationUrl: 'https://rxjs.dev/api/index/function/of',
	status: 'supported',
	defaults: ofElementPropsTemplate,
	properties: {
		argsFactoryExpression: {
			kind: 'callback',
			label: 'Arguments factory',
			signature: {
				arguments: [],
				returns: 'unknown | unknown[]',
				helpers: [],
				notes: 'Called without arguments per actual source subscription. Arrays emit each item; a non-array emits once.',
			},
		},
	},
	ports: creationElementDescriptor,
	referencePorts: ['input'],
	example: 'argsFactoryExpression: function argsFactory() { return [1, 2, 3, 4]; }',
	codeExport,
} as const satisfies OperatorDefinition<OfElementProperties>;

export const mapOperatorDefinition = {
	type: ElementType.Map,
	name: 'map',
	category: ElementGroup.Transformation,
	documentationUrl: 'https://rxjs.dev/api/operators/map',
	status: 'supported',
	defaults: mapElementPropsTemplate,
	properties: {
		projectExpression: {
			kind: 'callback',
			label: 'Project',
			signature: {
				arguments: [
					{ name: 'value', type: 'unknown (raw)' },
					{ name: 'index', type: 'number' },
				],
				returns: 'unknown',
				helpers: [],
				notes: 'The current adapter applies map to a one-value observable for each input: index is always 0. Preserve this behavior until #134 explicitly changes it.',
			},
		},
	},
	ports: pipeElementDescriptor,
	referencePorts: [],
	example: 'projectExpression: function project(value, index) { return value; }',
	codeExport,
} as const satisfies OperatorDefinition<MapElementProperties>;

export const mergeOperatorDefinition = {
	type: ElementType.Merge,
	name: 'merge',
	category: ElementGroup.JoinCreation,
	documentationUrl: 'https://rxjs.dev/api/index/function/merge',
	status: 'supported',
	defaults: mergeElementPropsTemplate,
	properties: {
		limitConcurrent: {
			kind: 'number',
			label: 'Limit concurrent',
			semantics:
				'Values > 0 supply the RxJS concurrency argument; 0 or a negative value omits it (unbounded).',
		},
	},
	ports: joinCreationElementDescriptor,
	referencePorts: ['input', 'event'],
	example:
		'Connect two of sources to event inputs; limitConcurrent: 0 merges both inputs without a concurrency cap.',
	codeExport,
} as const satisfies OperatorDefinition<MergeElementProperties>;

export const fromOperatorDefinition = {
	type: ElementType.From,
	name: 'from',
	category: ElementGroup.Creation,
	documentationUrl: 'https://rxjs.dev/api/index/function/from',
	status: 'supported',
	defaults: fromElementPropsTemplate,
	properties: {
		enableObservableEvent: {
			kind: 'boolean',
			label: 'Observable event',
			semantics:
				'True selects the connected factory and one event reference; false selects the input callback without an event port.',
		},
		inputCallbackExpression: {
			kind: 'callback',
			label: 'Input',
			activeWhen: { property: CommonProps.EnableObservableEvent, equals: false },
			signature: {
				arguments: [],
				returns: 'ObservableInput<unknown>',
				helpers: [],
				notes: 'Called without arguments on each actual subscription in input mode; each emitted raw item is wrapped in a new FlowValue. The inactive observableFactory is not evaluated.',
			},
		},
		observableFactory: {
			kind: 'callback',
			label: 'Input',
			activeWhen: { property: CommonProps.EnableObservableEvent, equals: true },
			signature: {
				arguments: [],
				returns: 'ObservableInput<FlowValue>',
				helpers: ['createObservable'],
				notes: 'The callback-producing expression is evaluated on each actual source subscription; its returned function is called without arguments on each subscription in connected mode. createObservable(overrides?) invokes the single event reference with a child subscription ID and preserves its FlowValues. The inactive input callback is not evaluated.',
			},
		},
	},
	ports: fromElementDescriptor,
	resolvePorts: findFromElementDescriptor,
	referencePorts: ['input', 'event'],
	example:
		'enableObservableEvent: false; inputCallbackExpression: function input() { return [1, 2, 3]; }',
	codeExport,
} as const satisfies OperatorDefinition<FromElementProperties>;

export const intervalOperatorDefinition = {
	type: ElementType.Interval,
	name: 'interval',
	category: ElementGroup.Creation,
	documentationUrl: 'https://rxjs.dev/api/index/function/interval',
	status: 'supported',
	defaults: intervalElementPropsTemplate,
	properties: {
		period: {
			kind: 'number',
			label: 'Period',
			semantics:
				'Delay in milliseconds before the first and each following sequential value (starting at zero). Passed unchanged to RxJS interval, including zero.',
		},
	},
	ports: creationElementDescriptor,
	referencePorts: ['input'],
	example: 'period: 1000 emits 0, 1, 2, ... at one-second intervals until unsubscribed.',
	codeExport,
} as const satisfies OperatorDefinition<IntervalElementProperties>;

export const rangeOperatorDefinition = {
	type: ElementType.Range,
	name: 'range',
	category: ElementGroup.Creation,
	documentationUrl: 'https://rxjs.dev/api/index/function/range',
	status: 'supported',
	defaults: rangeElementPropsTemplate,
	properties: {
		start: {
			kind: 'number',
			label: 'Start',
			semantics: 'Passed unchanged as the first RxJS range argument.',
		},
		count: {
			kind: 'number',
			optional: true,
			label: 'Count',
			semantics:
				'Optional second argument: omission preserves RxJS range(start) behavior (start is the count and emission starts at zero); zero emits no values. The saved template still defaults to 10.',
		},
	},
	ports: creationElementDescriptor,
	referencePorts: ['input'],
	example: 'start: 5, count: 3 emits 5, 6, 7 synchronously.',
	codeExport,
} as const satisfies OperatorDefinition<RangeElementProperties>;

export const timerOperatorDefinition = {
	type: ElementType.Timer,
	name: 'timer',
	category: ElementGroup.Creation,
	documentationUrl: 'https://rxjs.dev/api/index/function/timer',
	status: 'supported',
	defaults: timerElementPropsTemplate,
	properties: {
		dueDateType: {
			kind: 'number',
			label: 'Due date type',
			options: [
				{ value: DueDateType.Milliseconds, label: 'Milliseconds' },
				{ value: DueDateType.Date, label: 'Date' },
			],
			semantics:
				'Existing numeric mode: 0 is a relative delay; 1 interprets startDue as epoch milliseconds.',
		},
		startDue: {
			kind: 'number',
			label: 'Due milliseconds',
			semantics:
				'Stored as a number in both modes. Relative mode passes it unchanged; Date mode constructs a Date at the engine boundary (the form labels it Due date). Past dates keep RxJS scheduling behavior.',
		},
		intervalDuration: {
			kind: 'number',
			label: 'Interval duration',
			semantics:
				'Milliseconds between later values; -1 is the current one-shot default. Negative values complete after the first emission; zero repeats asynchronously per RxJS timer.',
		},
	},
	ports: creationElementDescriptor,
	referencePorts: ['input'],
	example: 'dueDateType: 0, startDue: 1000, intervalDuration: -1 emits 0 once after one second.',
	codeExport,
} as const satisfies OperatorDefinition<TimerElementProperties>;

export const iifOperatorDefinition = {
	type: ElementType.IIf,
	name: 'iif',
	category: ElementGroup.Creation,
	documentationUrl: 'https://rxjs.dev/api/index/function/iif',
	status: 'supported',
	defaults: iifElementPropsTemplate,
	properties: {
		conditionExpression: {
			kind: 'callback',
			label: 'Condition',
			signature: {
				arguments: [],
				returns: 'boolean',
				helpers: [],
				notes: 'The resolved condition expression, including direct overrides, is evaluated on each actual source subscription. Its returned function is called without arguments on every subscription; RxJS selects a branch by truthiness. No createObservable helper is injected into the condition.',
			},
		},
		trueCallbackExpression: {
			kind: 'callback',
			label: 'True result',
			signature: {
				arguments: [],
				returns: 'ObservableInput<FlowValue>',
				helpers: [OBSERVABLE_GENERATOR_NAME],
				notes: 'The resolved expression is evaluated only for the selected branch on each actual source subscription; an unchosen branch has no effects. Its returned function is called without arguments only when the condition is truthy. createObservable(overrides?) binds only the top event reference and forwards child overrides with the current child subscription ID; emitted FlowValues are preserved.',
			},
		},
		falseCallbackExpression: {
			kind: 'callback',
			label: 'False result',
			signature: {
				arguments: [],
				returns: 'ObservableInput<FlowValue>',
				helpers: [OBSERVABLE_GENERATOR_NAME],
				notes: 'The resolved expression is evaluated only for the selected branch on each actual source subscription; an unchosen branch has no effects. Its returned function is called without arguments only when the condition is falsy. createObservable(overrides?) binds only the bottom event reference and forwards child overrides with the current child subscription ID; emitted FlowValues are preserved.',
			},
		},
	},
	ports: iifElementDescriptor,
	referencePorts: ['input', 'event'],
	example:
		'Connect top and bottom event references; the default condition selects the top reference. Both references are required even when the condition is constant.',
	codeExport,
} as const satisfies OperatorDefinition<IifElementProperties>;

export const deferOperatorDefinition = {
	type: ElementType.Defer,
	name: 'defer',
	category: ElementGroup.Creation,
	documentationUrl: 'https://rxjs.dev/api/index/function/defer',
	status: 'supported',
	defaults: deferElementPropsTemplate,
	properties: {
		observableFactory: {
			kind: 'callback',
			label: 'Observable factory',
			signature: {
				arguments: [],
				returns: 'ObservableInput<FlowValue>',
				helpers: [OBSERVABLE_GENERATOR_NAME],
				notes: 'The resolved expression is evaluated on each actual source subscription, honoring direct observableFactory overrides. Its returned function is called without arguments on each subscription. createObservable(overrides?) binds the single event reference and forwards child overrides with the current child subscription ID; emitted FlowValues are preserved. Callbacks also receive lexical $context and immutable $params.',
			},
		},
	},
	ports: deferElementDescriptor,
	referencePorts: ['input', 'event'],
	example:
		'Connect one event reference; observableFactory: function input() { return createObservable({ count: 2 }); } forwards overrides to that reference on subscription.',
	codeExport,
} as const satisfies OperatorDefinition<DeferElementProperties>;

export const concatMapOperatorDefinition = {
	type: ElementType.ConcatMap,
	name: 'concatMap',
	category: ElementGroup.Transformation,
	documentationUrl: 'https://rxjs.dev/api/operators/concatMap',
	status: 'supported',
	defaults: concatMapElementPropsTemplate,
	properties: {
		projectExpression: {
			kind: 'callback',
			label: 'Project',
			signature: {
				arguments: [
					{ name: 'value', type: 'unknown (raw)' },
					{ name: 'index', type: 'number' },
				],
				returns: 'ObservableInput<FlowValue>',
				helpers: [OBSERVABLE_GENERATOR_NAME],
				notes: 'The expression is evaluated for each projected value, then its returned function receives the raw value and running projection index (reset per subscription). createObservable(overrides?) binds the single event reference and forwards overrides with a fresh child subscription ID. Subscription events depend on the projected FlowValue ID; returned FlowValues are preserved. ConcatMap queues source values until the preceding inner subscription completes.',
			},
		},
	},
	ports: eventPipeElementDescriptor,
	referencePorts: ['event'],
	example:
		'Connect one event reference; projectExpression: function project(value, index) { return createObservable({ count: index + 1 }); }',
	codeExport,
} as const satisfies OperatorDefinition<ConcatMapElementProperties>;

export const exhaustMapOperatorDefinition = {
	type: ElementType.ExhaustMap,
	name: 'exhaustMap',
	category: ElementGroup.Transformation,
	documentationUrl: 'https://rxjs.dev/api/operators/exhaustMap',
	status: 'supported',
	defaults: exhaustMapElementPropsTemplate,
	properties: {
		projectExpression: {
			kind: 'callback',
			label: 'Project',
			signature: {
				arguments: [
					{ name: 'value', type: 'unknown (raw)' },
					{ name: 'index', type: 'number' },
				],
				returns: 'ObservableInput<FlowValue>',
				helpers: [OBSERVABLE_GENERATOR_NAME],
				notes: 'The expression is evaluated for each projected value, then its returned function receives the raw value and running projection index (reset per subscription). createObservable(overrides?) binds the single event reference and forwards overrides with a fresh child subscription ID. Subscription events depend on the projected FlowValue ID; returned FlowValues are preserved. ExhaustMap skips source values while an inner subscription is active; skipped values do not advance the project index.',
			},
		},
	},
	ports: eventPipeElementDescriptor,
	referencePorts: ['event'],
	example:
		'Connect one event reference; projectExpression: function project(value, index) { return createObservable({ count: index + 1 }); }',
	codeExport,
} as const satisfies OperatorDefinition<ExhaustMapElementProperties>;

export const expandOperatorDefinition = {
	type: ElementType.Expand,
	name: 'expand',
	category: ElementGroup.Transformation,
	documentationUrl: 'https://rxjs.dev/api/operators/expand',
	status: 'supported',
	defaults: expandElementPropsTemplate,
	properties: {
		projectExpression: {
			kind: 'callback',
			label: 'Project',
			signature: {
				arguments: [
					{ name: 'value', type: 'unknown (raw)' },
					{ name: 'index', type: 'number' },
				],
				returns: 'ObservableInput<FlowValue>',
				helpers: [OBSERVABLE_GENERATOR_NAME],
				notes: 'The expression is evaluated for each projected value, then its returned function receives the raw value and running projection index (reset per subscription). createObservable(overrides?) binds the single event reference and forwards overrides with a fresh child subscription ID. Subscription events depend on the projected FlowValue ID; returned FlowValues are preserved. Expand also emits each source and recursively emitted FlowValue before projecting its raw value.',
			},
		},
		concurrent: {
			kind: 'number',
			optional: true,
			label: 'Concurrent',
			semantics:
				'Omitted means unbounded. Passed unchanged to RxJS expand; values below 1 are normalized to unbounded by RxJS.',
		},
	},
	ports: eventPipeElementDescriptor,
	referencePorts: ['event'],
	example:
		'Connect a Range event reference; projectExpression: function project(value, index) { return value < 3 ? createObservable({ start: value + 1, count: 1 }) : []; }',
	codeExport,
} as const satisfies OperatorDefinition<ExpandElementProperties>;

export const mergeMapOperatorDefinition = {
	type: ElementType.MergeMap,
	name: 'mergeMap',
	category: ElementGroup.Transformation,
	documentationUrl: 'https://rxjs.dev/api/operators/mergeMap',
	status: 'supported',
	defaults: mergeMapElementPropsTemplate,
	properties: {
		projectExpression: {
			kind: 'callback',
			label: 'Project',
			signature: {
				arguments: [
					{ name: 'value', type: 'unknown (raw)' },
					{ name: 'index', type: 'number' },
				],
				returns: 'ObservableInput<FlowValue>',
				helpers: [OBSERVABLE_GENERATOR_NAME],
				notes: 'The expression is evaluated for each projected value, then its returned function receives the raw value and running projection index (reset per subscription). createObservable(overrides?) binds the single event reference and forwards overrides with a fresh child subscription ID. Subscription events depend on the projected FlowValue ID; returned FlowValues are preserved. MergeMap queues source values when its concurrency limit is reached.',
			},
		},
		concurrent: {
			kind: 'number',
			optional: true,
			label: 'Concurrent',
			semantics:
				'Omitted means unbounded. Passed unchanged to RxJS mergeMap; zero or negative concurrency leaves values queued until unsubscribe.',
		},
	},
	ports: eventPipeElementDescriptor,
	referencePorts: ['event'],
	example:
		'Connect one event reference; projectExpression: function project(value, index) { return createObservable({ count: index + 1 }); }',
	codeExport,
} as const satisfies OperatorDefinition<MergeMapElementProperties>;

export const bufferOperatorDefinition = {
	type: ElementType.Buffer,
	name: 'buffer',
	category: ElementGroup.Transformation,
	documentationUrl: 'https://rxjs.dev/api/operators/buffer',
	status: 'supported',
	defaults: {},
	properties: {},
	ports: eventPipeElementDescriptor,
	referencePorts: ['event'],
	example:
		'Connect a Timer event reference to close a buffer; source completion flushes remaining raw values. No property form. The notifier factory and subscription event are created on each actual pipe subscription with a fresh ID. Buffer dependencies include source IDs and the notifier ID when present.',
	codeExport,
} as const satisfies OperatorDefinition<ElementProps>;

export const bufferCountOperatorDefinition = {
	type: ElementType.BufferCount,
	name: 'bufferCount',
	category: ElementGroup.Transformation,
	documentationUrl: 'https://rxjs.dev/api/operators/bufferCount',
	status: 'supported',
	defaults: bufferCountElementPropsTemplate,
	properties: {
		bufferSize: {
			kind: 'number',
			label: 'Buffer size',
			semantics: 'Passed unchanged as the RxJS bufferCount size.',
		},
		startBufferEvery: {
			kind: 'number',
			label: 'Start buffer every',
			semantics:
				'Passed unchanged as the RxJS bufferCount start interval; zero opens no buffers in the installed RxJS implementation. The saved default 2 overlaps buffers of size 3.',
		},
	},
	ports: pipeElementDescriptor,
	referencePorts: [],
	example:
		'bufferSize: 3, startBufferEvery: 2; input 1,2,3,4 emits [1,2,3] then [3,4] on completion.',
	codeExport,
} as const satisfies OperatorDefinition<BufferCountElementProperties>;

export const bufferTimeOperatorDefinition = {
	type: ElementType.BufferTime,
	name: 'bufferTime',
	category: ElementGroup.Transformation,
	documentationUrl: 'https://rxjs.dev/api/operators/bufferTime',
	status: 'supported',
	defaults: bufferTimeElementPropsTemplate,
	properties: {
		bufferTimeSpan: {
			kind: 'number',
			label: 'Buffer time span',
			semantics: 'Buffer lifetime in milliseconds, passed unchanged to RxJS bufferTime.',
		},
		bufferCreationInterval: {
			kind: 'number',
			optional: true,
			label: 'Buffer creation interval',
			semantics:
				'Optional interval in milliseconds for new buffers. Omission or a negative value uses sequential buffers; zero is forwarded unchanged.',
		},
		maxBufferSize: {
			kind: 'number',
			optional: true,
			label: 'Max buffer size',
			semantics:
				'The current adapter supplies this RxJS argument only when truthy. Omission and zero omit the cap; other values, including negatives, are forwarded unchanged.',
		},
	},
	ports: pipeElementDescriptor,
	referencePorts: [],
	example:
		'bufferTimeSpan: 100; maxBufferSize omitted; source completion flushes the current buffer.',
	codeExport,
} as const satisfies OperatorDefinition<BufferTimeElementProperties>;

export const bufferToggleOperatorDefinition = {
	type: ElementType.BufferToggle,
	name: 'bufferToggle',
	category: ElementGroup.Transformation,
	documentationUrl: 'https://rxjs.dev/api/operators/bufferToggle',
	status: 'supported',
	defaults: bufferToggleElementPropsTemplate,
	properties: {
		closingSelectorExpression: {
			kind: 'callback',
			label: 'Closing selector',
			signature: {
				arguments: [{ name: 'value', type: 'unknown (raw opening value)' }],
				returns: 'ObservableInput<FlowValue>',
				helpers: [OBSERVABLE_GENERATOR_NAME],
				notes: 'The expression is evaluated on each actual pipe subscription; its returned function receives each raw opening value, without an index. The top event reference supplies openings; createObservable(overrides?) binds only the bottom closing reference. Both helpers forward the same pipe-subscription ID. Closing subscription events currently use separate fresh IDs with the opening FlowValue as a dependency; these differ from the ID passed to the closing helper. Preserve this correlation mismatch until #129/#134 changes the runtime deliberately.',
			},
		},
	},
	ports: bufferToggleElementDescriptor,
	referencePorts: ['event'],
	example:
		'Connect top openings and bottom closing references; closingSelectorExpression: function closing(value) { return createObservable({ startDue: value }); }',
	codeExport,
} as const satisfies OperatorDefinition<BufferToggleElementProperties>;

export const bufferWhenOperatorDefinition = {
	type: ElementType.BufferWhen,
	name: 'bufferWhen',
	category: ElementGroup.Transformation,
	documentationUrl: 'https://rxjs.dev/api/operators/bufferWhen',
	status: 'supported',
	defaults: bufferWhenElementPropsTemplate,
	properties: {
		closingSelectorExpression: {
			kind: 'callback',
			label: 'Closing selector',
			signature: {
				arguments: [],
				returns: 'ObservableInput<FlowValue>',
				helpers: [OBSERVABLE_GENERATOR_NAME],
				notes: 'The expression is evaluated whenever RxJS opens a buffer, including the initial buffer on each subscription; its returned function receives no arguments. createObservable(overrides?) binds the single event reference and forwards overrides with a fresh subscription ID per selector invocation. The subscription event uses that same ID and has no value dependencies. A notifier emission closes and reopens the buffer; synchronous emitting notifiers can recurse immediately.',
			},
		},
	},
	ports: eventPipeElementDescriptor,
	referencePorts: ['event'],
	example:
		'Connect a Timer event reference; closingSelectorExpression: function closing() { return createObservable({ startDue: 100 }); }',
	codeExport,
} as const satisfies OperatorDefinition<BufferWhenElementProperties>;

export const combineLatestOperatorDefinition = {
	type: ElementType.CombineLatest,
	name: 'combineLatest',
	category: ElementGroup.JoinCreation,
	documentationUrl: 'https://rxjs.dev/api/index/function/combineLatest',
	status: 'supported',
	defaults: combineLatestElementPropsTemplate,
	properties: {
		observableInputsType: {
			kind: 'choice',
			label: 'Observable input type',
			options: [
				{ value: ObservableInputsType.Array, label: 'Array' },
				{ value: ObservableInputsType.Object, label: 'Object' },
			],
			semantics:
				'Array mode uses the supplied reference order. Object mode uses ConnectLine names as keys, with the last reference winning for duplicate names. The resolved field, including direct invocation overrides, selects the mode. Only array/object choices are valid. Joins consume their own parameters and do not forward overrides to children.',
		},
	},
	ports: joinCreationElementDescriptor,
	referencePorts: ['input', 'event'],
	example:
		'Connect two Of event references. Array mode emits a new raw array once all inputs have emitted, then on each input emission; dependencies are the current input FlowValue IDs. Children receive no broadcast overrides and fresh subscription IDs per subscription. Integer-like object keys retain JavaScript property enumeration order.',
	codeExport,
} as const satisfies OperatorDefinition<CombineLatestElementProperties>;

export const concatOperatorDefinition = {
	type: ElementType.Concat,
	name: 'concat',
	category: ElementGroup.JoinCreation,
	documentationUrl: 'https://rxjs.dev/api/index/function/concat',
	status: 'supported',
	defaults: {},
	properties: {},
	ports: joinCreationElementDescriptor,
	referencePorts: ['input', 'event'],
	example:
		'Connect two Of event references; the engine supplies them in ConnectLine index order. Subscribe sequentially with parent-correlated fresh child IDs and no broadcast overrides. Original FlowValues are preserved. With no references, complete without output.',
	codeExport,
} as const satisfies OperatorDefinition<ElementProps>;

export const forkJoinOperatorDefinition = {
	type: ElementType.ForkJoin,
	name: 'forkJoin',
	category: ElementGroup.JoinCreation,
	documentationUrl: 'https://rxjs.dev/api/index/function/forkJoin',
	status: 'supported',
	defaults: forkJoinElementPropsTemplate,
	properties: {
		observableInputsType: {
			kind: 'choice',
			label: 'Observable input type',
			options: [
				{ value: ObservableInputsType.Array, label: 'Array' },
				{ value: ObservableInputsType.Object, label: 'Object' },
			],
			semantics:
				'Array mode uses the supplied reference order. Object mode uses ConnectLine names as keys, with the last reference winning for duplicate names. The resolved field, including direct invocation overrides, selects the mode. Only array/object choices are valid. Joins consume their own parameters and do not forward overrides to children.',
		},
	},
	ports: joinCreationElementDescriptor,
	referencePorts: ['input', 'event'],
	example:
		'Connect two Range event references. Array mode emits one raw array of final values after all inputs complete; dependencies identify those final FlowValues. Children receive no broadcast overrides and fresh subscription IDs per subscription. An input completing without a value prevents output.',
	codeExport,
} as const satisfies OperatorDefinition<ForkJoinElementProperties>;

export const raceOperatorDefinition = {
	type: ElementType.Race,
	name: 'race',
	category: ElementGroup.JoinCreation,
	documentationUrl: 'https://rxjs.dev/api/index/function/race',
	status: 'supported',
	defaults: {},
	properties: {},
	ports: joinCreationElementDescriptor,
	referencePorts: ['input', 'event'],
	example:
		'Connect two Timer event references; the engine supplies them in ConnectLine index order. The first input notification wins; a synchronous winner can prevent later inputs from subscribing. Use parent-correlated fresh child IDs without broadcasting overrides; original FlowValues are preserved. With no references, remain open until cancellation.',
	codeExport,
} as const satisfies OperatorDefinition<ElementProps>;

export const zipOperatorDefinition = {
	type: ElementType.Zip,
	name: 'zip',
	category: ElementGroup.JoinCreation,
	documentationUrl: 'https://rxjs.dev/api/index/function/zip',
	status: 'supported',
	defaults: {},
	properties: {},
	ports: joinCreationElementDescriptor,
	referencePorts: ['input', 'event'],
	example:
		'Connect two Of event references; the engine supplies them in ConnectLine index order. Pair input values by emission index into new raw arrays with input FlowValue IDs as dependencies. Use parent-correlated fresh child IDs without broadcasting overrides. Complete when no further tuple can be formed; no references complete without output.',
	codeExport,
} as const satisfies OperatorDefinition<ElementProps>;

export const filterOperatorDefinition = {
	type: ElementType.Filter,
	name: 'filter',
	category: ElementGroup.Filtering,
	documentationUrl: 'https://rxjs.dev/api/operators/filter',
	status: 'supported',
	defaults: filterElementPropsTemplate,
	properties: {
		predicateExpression: {
			kind: 'callback',
			label: 'Predicate',
			signature: {
				arguments: [
					{ name: 'value', type: 'unknown (raw)' },
					{ name: 'index', type: 'number' },
				],
				returns: 'unknown (truthy predicate)',
				helpers: [],
				notes: 'The expression is evaluated on each actual pipe subscription; its returned predicate is reused across values within that subscription. Each input FlowValue is filtered through a one-value observable, so index is always 0. Truthy results retain the raw value and FlowValue identity fields via copy; falsy results drop the value. No createObservable helper is injected. The current viewer dispatcher has no Filter property form.',
			},
		},
	},
	ports: pipeElementDescriptor,
	referencePorts: [],
	example:
		'predicateExpression: function predicate(value, index) { return value % 2 === 0; } filters raw values while preserving their IDs.',
	codeExport,
} as const satisfies OperatorDefinition<FilterElementProperties>;

export const catchErrorOperatorDefinition = {
	type: ElementType.CatchError,
	name: 'catchError',
	category: ElementGroup.ErrorHandling,
	documentationUrl: 'https://rxjs.dev/api/operators/catchError',
	status: 'supported',
	defaults: catchErrorElementPropsTemplate,
	properties: {
		selectorExpression: {
			kind: 'callback',
			label: 'Project',
			signature: {
				arguments: [
					{ name: 'err', type: 'unknown (raw error from FlowValue)' },
					{ name: 'caught', type: 'Observable<unknown> (raw values)' },
				],
				returns: 'ObservableInput<FlowValue> | Observable<unknown>',
				helpers: [OBSERVABLE_GENERATOR_NAME],
				notes: 'One event reference is required even if the input never errors. The expression is evaluated on each actual pipe subscription; the returned selector is called only on errors with error.raw and the caught observable mapped to raw values. createObservable(overrides?) binds the recovery reference and forwards child overrides with one pipe-subscription ID reused across recoveries within that subscription. On each error a subscription event uses that same ID and the error FlowValue ID as a dependency, even if the selector does not call the helper. Passthrough and recovery FlowValues are preserved; returning caught forwards its raw items without rewrapping. Full lifecycle event correlation remains tracked in #129.',
			},
		},
	},
	ports: eventPipeElementDescriptor,
	referencePorts: ['event'],
	example:
		'Connect one recovery event reference; selectorExpression: function selector(err, caught) { return createObservable({ count: 2 }); } forwards overrides to that reference after an upstream error.',
	codeExport,
} as const satisfies OperatorDefinition<CatchErrorElementProperties>;

/** Current operator inventory. Internal Result and ConnectPoint elements are intentionally excluded. */
export const operatorDefinitions = {
	[ElementType.Ajax]: ajaxOperatorDefinition,
	[ElementType.Subscriber]: subscriberOperatorDefinition,
	[ElementType.Empty]: emptyOperatorDefinition,
	[ElementType.Generate]: generateOperatorDefinition,
	[ElementType.ThrowError]: throwErrorOperatorDefinition,
	[ElementType.Of]: ofOperatorDefinition,
	[ElementType.From]: fromOperatorDefinition,
	[ElementType.IIf]: iifOperatorDefinition,
	[ElementType.Defer]: deferOperatorDefinition,
	[ElementType.Interval]: intervalOperatorDefinition,
	[ElementType.Range]: rangeOperatorDefinition,
	[ElementType.Timer]: timerOperatorDefinition,
	[ElementType.ConcatMap]: concatMapOperatorDefinition,
	[ElementType.ExhaustMap]: exhaustMapOperatorDefinition,
	[ElementType.Expand]: expandOperatorDefinition,
	[ElementType.MergeMap]: mergeMapOperatorDefinition,
	[ElementType.Buffer]: bufferOperatorDefinition,
	[ElementType.BufferCount]: bufferCountOperatorDefinition,
	[ElementType.BufferTime]: bufferTimeOperatorDefinition,
	[ElementType.BufferToggle]: bufferToggleOperatorDefinition,
	[ElementType.BufferWhen]: bufferWhenOperatorDefinition,
	[ElementType.Filter]: filterOperatorDefinition,
	[ElementType.CatchError]: catchErrorOperatorDefinition,
	[ElementType.Map]: mapOperatorDefinition,
	[ElementType.CombineLatest]: combineLatestOperatorDefinition,
	[ElementType.Concat]: concatOperatorDefinition,
	[ElementType.ForkJoin]: forkJoinOperatorDefinition,
	[ElementType.Race]: raceOperatorDefinition,
	[ElementType.Zip]: zipOperatorDefinition,
	[ElementType.Merge]: mergeOperatorDefinition,
} as const;

export function findOperatorDefinition(type: ElementType) {
	return Object.prototype.hasOwnProperty.call(operatorDefinitions, type)
		? operatorDefinitions[type as keyof typeof operatorDefinitions]
		: undefined;
}

/** For consumers that require metadata; never silently substitute an empty definition. */
export function requireOperatorDefinition(type: ElementType) {
	const definition = findOperatorDefinition(type);
	if (!definition) {
		throw new Error(
			`Operator metadata is not registered for ${type}; see OPERATOR_DEFINITIONS.md (#140).`,
		);
	}
	return definition;
}
