import { describe, expect, it } from 'vitest';
import { CommonProps, ElementType } from '../element';
import {
	creationElementDescriptor,
	findElementDescriptor,
	calcConnectPointVisibility,
	joinCreationElementDescriptor,
	pipeElementDescriptor,
	subscriberElementDescriptor,
} from './elementDescriptors';

function expectPort(
	descriptor: ReturnType<typeof findElementDescriptor>,
	port: 'input' | 'output' | 'event',
	cardinality: number,
	allowedTypes: ElementType[],
) {
	expect(descriptor[port]?.cardinality).toBe(cardinality);
	expect(descriptor[port]?.allowedTypes).toEqual(new Set(allowedTypes));
}

const creationAndJoinTypes = [
	ElementType.Of,
	ElementType.From,
	ElementType.IIf,
	ElementType.Interval,
	ElementType.Ajax,
	ElementType.Empty,
	ElementType.Defer,
	ElementType.Generate,
	ElementType.Range,
	ElementType.ThrowError,
	ElementType.Timer,
	ElementType.Merge,
	ElementType.CombineLatest,
	ElementType.Concat,
	ElementType.ForkJoin,
	ElementType.Race,
	ElementType.Zip,
];

const pipeTypes = [
	ElementType.Buffer,
	ElementType.BufferCount,
	ElementType.BufferTime,
	ElementType.BufferToggle,
	ElementType.BufferWhen,
	ElementType.ExhaustMap,
	ElementType.Expand,
	ElementType.Map,
	ElementType.ConcatMap,
	ElementType.MergeMap,
	ElementType.Filter,
	ElementType.CatchError,
];

describe('findElementDescriptor', () => {
	it('describes ordinary creation operator inputs and outputs', () => {
		const descriptor = findElementDescriptor(ElementType.Of, {});

		expect(descriptor).toBe(creationElementDescriptor);
		expectPort(descriptor, 'input', 1, [
			ElementType.Merge,
			ElementType.CombineLatest,
			ElementType.Concat,
			ElementType.ForkJoin,
			ElementType.Race,
			ElementType.Zip,
			ElementType.CatchError,
			ElementType.Buffer,
			ElementType.BufferToggle,
			ElementType.BufferWhen,
			ElementType.ExhaustMap,
			ElementType.Expand,
			ElementType.IIf,
			ElementType.Defer,
			ElementType.From,
			ElementType.ConcatMap,
			ElementType.MergeMap,
		]);
		expectPort(descriptor, 'output', 1, [
			...pipeTypes,
			ElementType.IIf,
			ElementType.Defer,
			ElementType.From,
			ElementType.Subscriber,
		]);
		expect(descriptor.event).toBeUndefined();
	});

	it('allows join-creation operators to collect unlimited event inputs', () => {
		const descriptor = findElementDescriptor(ElementType.Merge, {});

		expect(descriptor).toBe(joinCreationElementDescriptor);
		expectPort(descriptor, 'event', Number.POSITIVE_INFINITY, creationAndJoinTypes);
	});

	it.each([
		[ElementType.IIf, 2],
		[ElementType.Defer, 1],
	] as const)('assigns %s its event-input cardinality', (type, cardinality) => {
		const descriptor = findElementDescriptor(type, {});

		expectPort(descriptor, 'event', cardinality, creationAndJoinTypes);
	});

	it('only exposes the from event input when observable events are enabled', () => {
		expect(findElementDescriptor(ElementType.From, {}).event).toBeUndefined();
		expect(
			findElementDescriptor(ElementType.From, {
				[CommonProps.EnableObservableEvent]: false,
			}).event,
		).toBeUndefined();
		expectPort(
			findElementDescriptor(ElementType.From, {
				[CommonProps.EnableObservableEvent]: true,
			}),
			'event',
			1,
			creationAndJoinTypes,
		);
	});

	it('describes ordinary pipe operator inputs and outputs', () => {
		const descriptor = findElementDescriptor(ElementType.Map, {});

		expect(descriptor).toBe(pipeElementDescriptor);
		expectPort(descriptor, 'input', 1, [...creationAndJoinTypes, ...pipeTypes]);
		expectPort(descriptor, 'output', 1, [...pipeTypes, ElementType.Subscriber]);
		expect(descriptor.event).toBeUndefined();
	});

	it.each([
		ElementType.Buffer,
		ElementType.BufferWhen,
		ElementType.ExhaustMap,
		ElementType.Expand,
		ElementType.ConcatMap,
		ElementType.MergeMap,
		ElementType.CatchError,
	] as const)('assigns %s one event input', (type) => {
		expectPort(findElementDescriptor(type, {}), 'event', 1, creationAndJoinTypes);
	});

	it('assigns bufferToggle two event inputs', () => {
		expectPort(
			findElementDescriptor(ElementType.BufferToggle, {}),
			'event',
			2,
			creationAndJoinTypes,
		);
	});

	it('describes subscribers as single-input terminal elements', () => {
		const descriptor = findElementDescriptor(ElementType.Subscriber, {});

		expect(descriptor).toBe(subscriberElementDescriptor);
		expectPort(descriptor, 'input', 1, [...creationAndJoinTypes, ...pipeTypes]);
		expect(descriptor.output).toBeUndefined();
		expect(descriptor.event).toBeUndefined();
	});

	it.each([ElementType.Result, ElementType.ConnectPoint])(
		'returns no ports for internal element type %s',
		(type) => {
			expect(findElementDescriptor(type, {})).toEqual({});
		},
	);

	it('returns no ports for an unknown element type', () => {
		expect(findElementDescriptor('unknown' as ElementType, {})).toEqual({});
	});
});

describe('calcConnectPointVisibility', () => {
	it.each([
		[ElementType.Of, {}, true, true, false],
		[ElementType.IIf, {}, true, true, true],
		[ElementType.From, { enableObservableEvent: false }, true, true, false],
		[ElementType.From, { enableObservableEvent: true }, true, true, true],
		[ElementType.Merge, {}, true, true, true],
		[ElementType.Map, {}, true, true, false],
		[ElementType.BufferToggle, {}, true, true, true],
		[ElementType.Subscriber, {}, true, false, false],
		[ElementType.Result, {}, false, false, false],
	] as const)(
		'reports visible ports for %s',
		(type, properties, inputVisible, outputVisible, eventsVisible) => {
			expect(calcConnectPointVisibility(type, properties)).toEqual({
				inputVisible,
				outputVisible,
				eventsVisible,
			});
		},
	);
});
