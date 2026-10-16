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
import { OfElementProperties, ofElementPropsTemplate } from '../creationOperators/OfElement';
import {
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
import { CommonProps, ElementProps } from '../element/Element';
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
				notes: 'Called without arguments per factory invocation. Arrays emit each item; a non-array emits once.',
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
				notes: 'Called without arguments when the source factory is invoked in input mode; each emitted raw item is wrapped in a new FlowValue. The inactive observableFactory is not evaluated.',
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
				notes: 'The callback-producing expression is evaluated at source factory invocation; its returned function is called without arguments on each subscription in connected mode. createObservable(overrides?) invokes the single event reference with a child subscription ID and preserves its FlowValues. The inactive input callback is not evaluated.',
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
				notes: 'The stored condition expression is evaluated at source factory invocation, ignoring a conditionExpression override in the current adapter. Its returned function is called without arguments on every subscription; RxJS selects a branch by truthiness. No createObservable helper is injected into the condition.',
			},
		},
		trueCallbackExpression: {
			kind: 'callback',
			label: 'True result',
			signature: {
				arguments: [],
				returns: 'ObservableInput<FlowValue>',
				helpers: [OBSERVABLE_GENERATOR_NAME],
				notes: 'The expression is evaluated at source factory invocation, including for an unchosen branch; direct overrides of this field are applied. Its returned function is called without arguments only when the condition is truthy. createObservable(overrides?) binds only the top event reference and forwards child overrides with the current child subscription ID; emitted FlowValues are preserved.',
			},
		},
		falseCallbackExpression: {
			kind: 'callback',
			label: 'False result',
			signature: {
				arguments: [],
				returns: 'ObservableInput<FlowValue>',
				helpers: [OBSERVABLE_GENERATOR_NAME],
				notes: 'The expression is evaluated at source factory invocation, including for an unchosen branch; direct overrides of this field are applied. Its returned function is called without arguments only when the condition is falsy. createObservable(overrides?) binds only the bottom event reference and forwards child overrides with the current child subscription ID; emitted FlowValues are preserved.',
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
				notes: 'The stored expression is evaluated at source factory invocation; the current adapter ignores top-level invocation overrides, including observableFactory. Its returned function is called without arguments on each subscription. createObservable(overrides?) binds the single event reference and forwards child overrides with the current child subscription ID; emitted FlowValues are preserved. This is not the future #134 invocation contract.',
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
		'Connect a Timer event reference to close a buffer; source completion flushes remaining raw values. No property form. The notifier factory and subscription event are created when the pipe is applied, using one ID shared by repeated subscriptions to that returned observable. Buffer dependencies include source IDs and the notifier ID when present.',
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
				notes: 'The expression is evaluated once when the pipe factory is applied, before subscription; its returned function receives each raw opening value, without an index. The top event reference supplies openings; createObservable(overrides?) binds only the bottom closing reference. Both helpers forward the same application-time subscription ID. Closing subscription events currently use separate fresh IDs with the opening FlowValue as a dependency; these differ from the ID passed to the closing helper. Preserve this correlation mismatch until #129/#134 changes the runtime deliberately.',
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

/** Only migrated operators belong here. Absence must not be interpreted as unsupported execution. */
export const operatorDefinitions = {
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
	[ElementType.Map]: mapOperatorDefinition,
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
