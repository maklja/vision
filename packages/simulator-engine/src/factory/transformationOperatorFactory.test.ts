import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	ConnectLine,
	ConnectPointPosition,
	ConnectPointType,
	Element,
	ElementProps,
	ElementType,
	FlowValueType,
} from '@maklja/vision-simulator-model';
import { createSimulationModel, ObservableSimulation } from '../ObservableSimulation';
import { FlowValueEvent } from '../context';
import { MissingReferenceObservableError } from '../errors';

type ConnectPoint = [string, ConnectPointType, ConnectPointPosition];

function element(id: string, type: ElementType, properties: ElementProps = {}): Element {
	return { id, type, name: id, x: 0, y: 0, visible: true, properties };
}

function connectLine(
	id: string,
	source: ConnectPoint,
	target: ConnectPoint,
	index = 0,
	name = '',
): ConnectLine {
	return {
		id,
		source: { id: source[0], connectPointType: source[1], connectPosition: source[2] },
		target: { id: target[0], connectPointType: target[1], connectPosition: target[2] },
		points: [],
		locked: false,
		index,
		name,
	};
}

const output = (id: string): ConnectPoint => [
	id,
	ConnectPointType.Output,
	ConnectPointPosition.Right,
];
const input = (id: string): ConnectPoint => [id, ConnectPointType.Input, ConnectPointPosition.Left];
const eventPoint = (id: string, position = ConnectPointPosition.Top): ConnectPoint => [
	id,
	ConnectPointType.Event,
	position,
];

const subscriber = (id: string) => element(id, ElementType.Subscriber);
const ofElement = (id: string, values: unknown[]) =>
	element(id, ElementType.Of, {
		argsFactoryExpression: `function argsFactory() { return ${JSON.stringify(values)}; }`,
	});
const intervalElement = (id: string, period: number) =>
	element(id, ElementType.Interval, { period });
const timerElement = (id: string, startDue: number) =>
	element(id, ElementType.Timer, { dueDateType: 0, startDue, intervalDuration: -1 });

interface SimulationRun {
	readonly events: FlowValueEvent[];
	readonly error: unknown;
	readonly completed: boolean;
	unsubscribe: () => void;
}

function startSimulation(
	entryElementId: string,
	elements: Element[],
	connectLines: ConnectLine[],
): SimulationRun {
	const events: FlowValueEvent[] = [];
	let error: unknown = null;
	let completed = false;
	const model = createSimulationModel(entryElementId, elements, connectLines);
	const subscription = new ObservableSimulation(model).start({
		next: (event) => events.push(event),
		error: (value) => {
			error = value;
		},
		complete: () => {
			completed = true;
		},
	});

	return {
		events,
		get error() {
			return error;
		},
		get completed() {
			return completed;
		},
		unsubscribe: () => subscription.unsubscribe(),
	};
}

function eventsFrom(run: SimulationRun, elementId: string): FlowValueEvent[] {
	return run.events.filter((event) => event.sourceElementId === elementId);
}

function nextValues(run: SimulationRun, elementId: string): string[] {
	return eventsFrom(run, elementId)
		.filter((event) => event.type === FlowValueType.Next)
		.map((event) => event.value);
}

function nextCount(run: SimulationRun, elementId: string): number {
	return eventsFrom(run, elementId).filter((event) => event.type === FlowValueType.Next).length;
}

function subscribeCount(run: SimulationRun, elementId: string): number {
	return eventsFrom(run, elementId).filter((event) => event.type === FlowValueType.Subscribe)
		.length;
}

function singleReferenceGraph(
	operator: Element,
	reference: Element,
): {
	elements: Element[];
	connectLines: ConnectLine[];
} {
	return {
		elements: [
			ofElement('source', [1, 2]),
			operator,
			reference,
			subscriber('subscriber'),
			subscriber('referenceSubscriber'),
		],
		connectLines: [
			connectLine('source-operator', output('source'), input(operator.id)),
			connectLine('operator-subscriber', output(operator.id), input('subscriber'), 1),
			connectLine('operator-reference', eventPoint(operator.id), input(reference.id), 2),
			connectLine(
				'reference-subscriber',
				output(reference.id),
				input('referenceSubscriber'),
				3,
			),
		],
	};
}

beforeEach(() => {
	vi.useRealTimers();
});

describe('transformationOperatorFactory', () => {
	it('map: should transform values according to projectExpression', () => {
		const map = element('operator', ElementType.Map, {
			projectExpression: 'function project(value) { return value * 10; }',
		});
		const run = startSimulation(
			'source',
			[ofElement('source', [1, 2, 3]), map, subscriber('subscriber')],
			[
				connectLine('source-operator', output('source'), input('operator')),
				connectLine('operator-subscriber', output('operator'), input('subscriber'), 1),
			],
		);

		expect(nextValues(run, 'operator')).toEqual(['10', '20', '30']);
		expect(run.completed).toBe(true);
	});

	it('map: should report completion after a time based source finishes', () => {
		vi.useFakeTimers();
		try {
			const map = element('operator', ElementType.Map, {
				projectExpression: 'function project(value) { return value * 10; }',
			});
			const run = startSimulation(
				'source',
				[timerElement('source', 100), map, subscriber('subscriber')],
				[
					connectLine('source-operator', output('source'), input('operator')),
					connectLine('operator-subscriber', output('operator'), input('subscriber'), 1),
				],
			);

			expect(run.completed).toBe(false);

			vi.advanceTimersByTime(100);

			expect(nextValues(run, 'operator')).toEqual(['0']);
			expect(run.completed).toBe(true);
		} finally {
			vi.useRealTimers();
		}
	});

	it('buffer: should buffer values until the reference observable emits', () => {
		const buffer = element('operator', ElementType.Buffer);
		const run = startSimulation(
			'source',
			[
				ofElement('source', [1, 2, 3]),
				buffer,
				ofElement('reference', ['trigger']),
				subscriber('subscriber'),
				subscriber('referenceSubscriber'),
			],
			[
				connectLine('source-operator', output('source'), input('operator')),
				connectLine('operator-subscriber', output('operator'), input('subscriber'), 1),
				connectLine('operator-reference', eventPoint('operator'), input('reference'), 2),
				connectLine(
					'reference-subscriber',
					output('reference'),
					input('referenceSubscriber'),
					3,
				),
			],
		);

		expect(eventsFrom(run, 'operator')[0]).toMatchObject({
			type: FlowValueType.Subscribe,
			targetElementId: 'reference',
		});
		expect(nextValues(run, 'operator')).toEqual(['1,2,3']);
	});

	it('buffer: should close a buffer when a time based reference emits', () => {
		vi.useFakeTimers();
		try {
			const buffer = element('operator', ElementType.Buffer);
			const run = startSimulation(
				'source',
				[
					intervalElement('source', 100),
					buffer,
					timerElement('reference', 250),
					subscriber('subscriber'),
					subscriber('referenceSubscriber'),
				],
				[
					connectLine('source-operator', output('source'), input('operator')),
					connectLine('operator-subscriber', output('operator'), input('subscriber'), 1),
					connectLine(
						'operator-reference',
						eventPoint('operator'),
						input('reference'),
						2,
					),
					connectLine(
						'reference-subscriber',
						output('reference'),
						input('referenceSubscriber'),
						3,
					),
				],
			);

			vi.advanceTimersByTime(520);
			expect(nextValues(run, 'operator')).toEqual(['0,1']);
			run.unsubscribe();
		} finally {
			vi.useRealTimers();
		}
	});

	it('buffer: should throw MissingReferenceObservableError if reference observable is omitted', () => {
		const buffer = element('operator', ElementType.Buffer);

		expect(() =>
			startSimulation(
				'source',
				[ofElement('source', [1, 2, 3]), buffer, subscriber('subscriber')],
				[
					connectLine('source-operator', output('source'), input('operator')),
					connectLine('operator-subscriber', output('operator'), input('subscriber'), 1),
				],
			),
		).toThrow(MissingReferenceObservableError);
	});

	it('bufferCount: should buffer values based on bufferSize and startBufferEvery', () => {
		const bufferCount = element('operator', ElementType.BufferCount, {
			bufferSize: 2,
			startBufferEvery: 2,
		});
		const run = startSimulation(
			'source',
			[ofElement('source', [1, 2, 3, 4, 5]), bufferCount, subscriber('subscriber')],
			[
				connectLine('source-operator', output('source'), input('operator')),
				connectLine('operator-subscriber', output('operator'), input('subscriber'), 1),
			],
		);

		expect(nextValues(run, 'operator')).toEqual(['1,2', '3,4', '5']);
	});

	it('bufferTime: should buffer values based on bufferTimeSpan and bufferCreationInterval', () => {
		vi.useFakeTimers();
		try {
			const bufferTime = element('operator', ElementType.BufferTime, {
				bufferTimeSpan: 200,
				bufferCreationInterval: 250,
			});
			const run = startSimulation(
				'source',
				[intervalElement('source', 100), bufferTime, subscriber('subscriber')],
				[
					connectLine('source-operator', output('source'), input('operator')),
					connectLine('operator-subscriber', output('operator'), input('subscriber'), 1),
				],
			);

			vi.advanceTimersByTime(520);

			expect(nextValues(run, 'operator')).toEqual(['0', '2,3']);
			run.unsubscribe();
		} finally {
			vi.useRealTimers();
		}
	});

	it('bufferTime: should respect maxBufferSize when configured', () => {
		vi.useFakeTimers();
		try {
			const bufferTime = element('operator', ElementType.BufferTime, {
				bufferTimeSpan: 250,
				maxBufferSize: 2,
			});
			const run = startSimulation(
				'source',
				[intervalElement('source', 100), bufferTime, subscriber('subscriber')],
				[
					connectLine('source-operator', output('source'), input('operator')),
					connectLine('operator-subscriber', output('operator'), input('subscriber'), 1),
				],
			);

			vi.advanceTimersByTime(520);

			expect(nextValues(run, 'operator')).toEqual(['0,1', '2,3']);
			run.unsubscribe();
		} finally {
			vi.useRealTimers();
		}
	});

	it('bufferToggle: should open buffers based on source reference and close them based on closing reference observable', () => {
		vi.useFakeTimers();
		try {
			const bufferToggle = element('operator', ElementType.BufferToggle, {
				closingSelectorExpression:
					'function closingSelector(value) { return createObservable(); }',
			});
			const run = startSimulation(
				'source',
				[
					intervalElement('source', 100),
					bufferToggle,
					timerElement('opening', 50),
					timerElement('closing', 150),
					subscriber('subscriber'),
					subscriber('openingSubscriber'),
					subscriber('closingSubscriber'),
				],
				[
					connectLine('source-operator', output('source'), input('operator')),
					connectLine('operator-subscriber', output('operator'), input('subscriber'), 1),
					connectLine(
						'operator-opening',
						eventPoint('operator', ConnectPointPosition.Top),
						input('opening'),
						2,
					),
					connectLine(
						'operator-closing',
						eventPoint('operator', ConnectPointPosition.Bottom),
						input('closing'),
						3,
					),
					connectLine(
						'opening-subscriber',
						output('opening'),
						input('openingSubscriber'),
						4,
					),
					connectLine(
						'closing-subscriber',
						output('closing'),
						input('closingSubscriber'),
						5,
					),
				],
			);

			vi.advanceTimersByTime(520);

			expect(subscribeCount(run, 'operator')).toBe(2);
			expect(nextValues(run, 'operator')).toEqual(['0,1']);
			run.unsubscribe();
		} finally {
			vi.useRealTimers();
		}
	});

	it('bufferWhen: should buffer values and close them based on closingSelectorExpression and the reference observable', () => {
		vi.useFakeTimers();
		try {
			const bufferWhen = element('operator', ElementType.BufferWhen, {
				closingSelectorExpression:
					'function closingSelector() { return createObservable(); }',
			});
			const run = startSimulation(
				'source',
				[
					intervalElement('source', 100),
					bufferWhen,
					timerElement('reference', 250),
					subscriber('subscriber'),
					subscriber('referenceSubscriber'),
				],
				[
					connectLine('source-operator', output('source'), input('operator')),
					connectLine('operator-subscriber', output('operator'), input('subscriber'), 1),
					connectLine(
						'operator-reference',
						eventPoint('operator'),
						input('reference'),
						2,
					),
					connectLine(
						'reference-subscriber',
						output('reference'),
						input('referenceSubscriber'),
						3,
					),
				],
			);

			vi.advanceTimersByTime(520);

			expect(nextValues(run, 'operator')).toEqual(['0,1', '2,3,4']);
			run.unsubscribe();
		} finally {
			vi.useRealTimers();
		}
	});

	it('concatMap: should map values to inner observables and concatenate them sequentially', () => {
		vi.useFakeTimers();
		try {
			const concatMap = element('operator', ElementType.ConcatMap, {
				projectExpression: 'function project(value, index) { return createObservable(); }',
			});
			const graph = singleReferenceGraph(concatMap, timerElement('reference', 100));
			const run = startSimulation('source', graph.elements, graph.connectLines);

			vi.advanceTimersByTime(100);
			expect(nextCount(run, 'operator')).toBe(1);

			vi.advanceTimersByTime(250);
			expect(nextCount(run, 'operator')).toBe(2);
			expect(subscribeCount(run, 'operator')).toBe(2);
			run.unsubscribe();
		} finally {
			vi.useRealTimers();
		}
	});

	it('mergeMap: should map values to inner observables and merge them concurrently', () => {
		vi.useFakeTimers();
		try {
			const mergeMap = element('operator', ElementType.MergeMap, {
				projectExpression: 'function project(value, index) { return createObservable(); }',
			});
			const graph = singleReferenceGraph(mergeMap, timerElement('reference', 100));
			const run = startSimulation('source', graph.elements, graph.connectLines);

			vi.advanceTimersByTime(100);

			expect(nextCount(run, 'operator')).toBe(2);
			expect(subscribeCount(run, 'operator')).toBe(2);
			run.unsubscribe();
		} finally {
			vi.useRealTimers();
		}
	});

	it('exhaustMap: should map values to inner observables and ignore new source values while inner is active', () => {
		vi.useFakeTimers();
		try {
			const exhaustMap = element('operator', ElementType.ExhaustMap, {
				projectExpression: 'function project(value, index) { return createObservable(); }',
			});
			const graph = singleReferenceGraph(exhaustMap, timerElement('reference', 100));
			const run = startSimulation('source', graph.elements, graph.connectLines);

			vi.advanceTimersByTime(100);
			expect(nextCount(run, 'operator')).toBe(1);

			vi.advanceTimersByTime(250);
			expect(nextCount(run, 'operator')).toBe(1);
			expect(subscribeCount(run, 'operator')).toBe(1);
			run.unsubscribe();
		} finally {
			vi.useRealTimers();
		}
	});

	it('expand: should recursively map values based on projectExpression', () => {
		const expand = element('operator', ElementType.Expand, {
			projectExpression:
				'function project(value, index) { return createObservable({ start: value + 1, count: value < 2 ? 1 : 0 }); }',
		});
		const run = startSimulation(
			'source',
			[
				ofElement('source', [1]),
				expand,
				element('reference', ElementType.Range, { start: 0, count: 0 }),
				subscriber('subscriber'),
				subscriber('referenceSubscriber'),
			],
			[
				connectLine('source-operator', output('source'), input('operator')),
				connectLine('operator-subscriber', output('operator'), input('subscriber'), 1),
				connectLine('operator-reference', eventPoint('operator'), input('reference'), 2),
				connectLine(
					'reference-subscriber',
					output('reference'),
					input('referenceSubscriber'),
					3,
				),
			],
		);

		expect(nextValues(run, 'operator')).toEqual(['1', '2']);
		expect(subscribeCount(run, 'operator')).toBe(2);
	});
});
