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
} from '../descriptors/elementDescriptors';
import { CommonProps } from '../element/Element';
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

/** Only migrated operators belong here. Absence must not be interpreted as unsupported execution. */
export const operatorDefinitions = {
	[ElementType.Of]: ofOperatorDefinition,
	[ElementType.From]: fromOperatorDefinition,
	[ElementType.IIf]: iifOperatorDefinition,
	[ElementType.Defer]: deferOperatorDefinition,
	[ElementType.Interval]: intervalOperatorDefinition,
	[ElementType.Range]: rangeOperatorDefinition,
	[ElementType.Timer]: timerOperatorDefinition,
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
