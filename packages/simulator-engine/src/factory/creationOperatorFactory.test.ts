import { describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';
import {
	ConnectLine,
	ConnectPointPosition,
	ConnectPointType,
	Element,
	ElementProps,
	ElementType,
	FlowValueType,
	HttpMethod,
} from '@maklja/vision-simulator-model';
import { createSimulationModel, ObservableSimulation } from '../ObservableSimulation';
import { FlowValueEvent } from '../context';
import { InvalidElementPropertyValueError, MissingReferenceObservableError } from '../errors';

const { ajaxMock } = vi.hoisted(() => ({ ajaxMock: vi.fn() }));
vi.mock('rxjs/ajax', () => ({ ajax: ajaxMock }));

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

interface SimulationResult {
	events: FlowValueEvent[];
	error: unknown;
	completed: boolean;
}

function runSimulation(
	entryElementId: string,
	elements: Element[],
	connectLines: ConnectLine[],
): SimulationResult {
	const events: FlowValueEvent[] = [];
	let error: unknown = null;
	let completed = false;
	const model = createSimulationModel(entryElementId, elements, connectLines);
	new ObservableSimulation(model).start({
		next: (event) => events.push(event),
		error: (value) => {
			error = value;
		},
		complete: () => {
			completed = true;
		},
	});

	return { events, error, completed };
}

function eventsFrom(result: SimulationResult, elementId: string): FlowValueEvent[] {
	return result.events.filter((event) => event.sourceElementId === elementId);
}

function nextValues(result: SimulationResult, elementId: string): string[] {
	return eventsFrom(result, elementId)
		.filter((event) => event.type === FlowValueType.Next)
		.map((event) => event.value);
}

describe('creationOperatorFactory', () => {
	it('of: should emit the exact arguments provided by argsFactoryExpression', () => {
		const result = runSimulation(
			'source',
			[ofElement('source', [1, 'two', true]), subscriber('subscriber')],
			[connectLine('source-subscriber', output('source'), input('subscriber'))],
		);

		expect(nextValues(result, 'source')).toEqual(['1', 'two', 'true']);
		expect(result.completed).toBe(true);
	});

	it('from: should create an observable from an inputCallbackExpression array', () => {
		const from = element('source', ElementType.From, {
			enableObservableEvent: false,
			inputCallbackExpression: 'function input() { return [1, 2, 3]; }',
			observableFactory: 'function input() { return createObservable(); }',
		});

		const result = runSimulation(
			'source',
			[from, subscriber('subscriber')],
			[connectLine('source-subscriber', output('source'), input('subscriber'))],
		);

		expect(nextValues(result, 'source')).toEqual(['1', '2', '3']);
		expect(result.completed).toBe(true);
	});

	it('from: should use reference observable if enableObservableEvent is true', () => {
		const from = element('source', ElementType.From, {
			enableObservableEvent: true,
			inputCallbackExpression: 'function input() { return [1, 2, 3]; }',
			observableFactory: 'function input() { return createObservable(); }',
		});

		const result = runSimulation(
			'source',
			[
				from,
				ofElement('reference', ['a', 'b']),
				subscriber('subscriber'),
				subscriber('referenceSubscriber'),
			],
			[
				connectLine('source-subscriber', output('source'), input('subscriber')),
				connectLine('source-reference', eventPoint('source'), input('reference')),
				connectLine(
					'reference-subscriber',
					output('reference'),
					input('referenceSubscriber'),
					1,
				),
			],
		);

		expect(nextValues(result, 'source')).toEqual(['a', 'b']);
		expect(eventsFrom(result, 'source')[0]).toMatchObject({
			type: FlowValueType.Subscribe,
			value: 'null',
			targetElementId: 'reference',
		});
	});

	it('from: should throw MissingReferenceObservableError if no reference is provided', () => {
		const from = element('source', ElementType.From, {
			enableObservableEvent: true,
			inputCallbackExpression: 'function input() { return [1, 2, 3]; }',
			observableFactory: 'function input() { return createObservable(); }',
		});

		expect(() =>
			runSimulation(
				'source',
				[from, subscriber('subscriber')],
				[connectLine('source-subscriber', output('source'), input('subscriber'))],
			),
		).toThrow(MissingReferenceObservableError);
	});

	it('defer: should subscribe to the reference observable when subscribed to', () => {
		const defer = element('source', ElementType.Defer, {
			observableFactory: 'function input() { return createObservable(); }',
		});

		const result = runSimulation(
			'source',
			[
				defer,
				ofElement('reference', ['x', 'y']),
				subscriber('subscriber'),
				subscriber('referenceSubscriber'),
			],
			[
				connectLine('source-subscriber', output('source'), input('subscriber')),
				connectLine('source-reference', eventPoint('source'), input('reference')),
				connectLine(
					'reference-subscriber',
					output('reference'),
					input('referenceSubscriber'),
					1,
				),
			],
		);

		expect(nextValues(result, 'source')).toEqual(['x', 'y']);
		expect(eventsFrom(result, 'source')[0]).toMatchObject({
			type: FlowValueType.Subscribe,
			targetElementId: 'reference',
		});
	});

	it('defer: should throw MissingReferenceObservableError if no reference is provided', () => {
		const defer = element('source', ElementType.Defer, {
			observableFactory: 'function input() { return createObservable(); }',
		});

		expect(() =>
			runSimulation(
				'source',
				[defer, subscriber('subscriber')],
				[connectLine('source-subscriber', output('source'), input('subscriber'))],
			),
		).toThrow(MissingReferenceObservableError);
	});

	it('empty: should complete immediately without emitting values', () => {
		const result = runSimulation(
			'source',
			[element('source', ElementType.Empty), subscriber('subscriber')],
			[connectLine('source-subscriber', output('source'), input('subscriber'))],
		);

		expect(result.events).toEqual([]);
		expect(result.completed).toBe(true);
	});

	it('generate: should generate values based on initialState, iterate, and resultSelector expressions', () => {
		const generate = element('source', ElementType.Generate, {
			initialState: '0',
			condition: 'function condition(value) { return value < 3; }',
			iterate: 'function iterate(value) { return value + 1; }',
			resultSelector: 'function resultSelector(value) { return value * 1000; }',
		});

		const result = runSimulation(
			'source',
			[generate, subscriber('subscriber')],
			[connectLine('source-subscriber', output('source'), input('subscriber'))],
		);

		expect(nextValues(result, 'source')).toEqual(['0', '1000', '2000']);
		expect(result.completed).toBe(true);
	});

	it('iif: should subscribe to true branch observable when conditionExpression is true', () => {
		const iif = element('source', ElementType.IIf, {
			conditionExpression: 'function condition() { return true; }',
			trueCallbackExpression: 'function trueResult() { return createObservable(); }',
			falseCallbackExpression: 'function falseResult() { return createObservable(); }',
		});

		const result = runSimulation(
			'source',
			[
				iif,
				ofElement('trueBranch', [1]),
				ofElement('falseBranch', [99]),
				subscriber('subscriber'),
				subscriber('trueSubscriber'),
				subscriber('falseSubscriber'),
			],
			[
				connectLine('source-subscriber', output('source'), input('subscriber')),
				connectLine(
					'source-true',
					eventPoint('source', ConnectPointPosition.Top),
					input('trueBranch'),
				),
				connectLine(
					'source-false',
					eventPoint('source', ConnectPointPosition.Bottom),
					input('falseBranch'),
				),
				connectLine('true-subscriber', output('trueBranch'), input('trueSubscriber'), 1),
				connectLine('false-subscriber', output('falseBranch'), input('falseSubscriber'), 2),
			],
		);

		expect(eventsFrom(result, 'source')[0]).toMatchObject({
			type: FlowValueType.Subscribe,
			targetElementId: 'trueBranch',
		});
		expect(nextValues(result, 'source')).toEqual(['1']);
	});

	it('iif: should subscribe to false branch observable when conditionExpression is false', () => {
		const iif = element('source', ElementType.IIf, {
			conditionExpression: 'function condition() { return false; }',
			trueCallbackExpression: 'function trueResult() { return createObservable(); }',
			falseCallbackExpression: 'function falseResult() { return createObservable(); }',
		});

		const result = runSimulation(
			'source',
			[
				iif,
				ofElement('trueBranch', [1]),
				ofElement('falseBranch', [99]),
				subscriber('subscriber'),
				subscriber('trueSubscriber'),
				subscriber('falseSubscriber'),
			],
			[
				connectLine('source-subscriber', output('source'), input('subscriber')),
				connectLine(
					'source-true',
					eventPoint('source', ConnectPointPosition.Top),
					input('trueBranch'),
				),
				connectLine(
					'source-false',
					eventPoint('source', ConnectPointPosition.Bottom),
					input('falseBranch'),
				),
				connectLine('true-subscriber', output('trueBranch'), input('trueSubscriber'), 1),
				connectLine('false-subscriber', output('falseBranch'), input('falseSubscriber'), 2),
			],
		);

		expect(eventsFrom(result, 'source')[0]).toMatchObject({
			type: FlowValueType.Subscribe,
			targetElementId: 'falseBranch',
		});
		expect(nextValues(result, 'source')).toEqual(['99']);
	});

	it('iif: should throw MissingReferenceObservableError if the true branch is missing', () => {
		const iif = element('source', ElementType.IIf, {
			conditionExpression: 'function condition() { return true; }',
			trueCallbackExpression: 'function trueResult() { return createObservable(); }',
			falseCallbackExpression: 'function falseResult() { return createObservable(); }',
		});

		const error = expect(() =>
			runSimulation(
				'source',
				[iif, subscriber('subscriber')],
				[connectLine('source-subscriber', output('source'), input('subscriber'))],
			),
		);

		error.toThrow(MissingReferenceObservableError);
		error.toThrow('Not found true branch observable operator');
	});

	it('iif: should throw MissingReferenceObservableError if the false branch is missing', () => {
		const iif = element('source', ElementType.IIf, {
			conditionExpression: 'function condition() { return true; }',
			trueCallbackExpression: 'function trueResult() { return createObservable(); }',
			falseCallbackExpression: 'function falseResult() { return createObservable(); }',
		});

		const error = expect(() =>
			runSimulation(
				'source',
				[
					iif,
					ofElement('trueBranch', [1]),
					subscriber('subscriber'),
					subscriber('trueSubscriber'),
				],
				[
					connectLine('source-subscriber', output('source'), input('subscriber')),
					connectLine(
						'source-true',
						eventPoint('source', ConnectPointPosition.Top),
						input('trueBranch'),
					),
					connectLine(
						'true-subscriber',
						output('trueBranch'),
						input('trueSubscriber'),
						1,
					),
				],
			),
		);

		error.toThrow(MissingReferenceObservableError);
		error.toThrow('Not found false branch observable operator');
	});

	it('interval: should emit sequential numbers at the specified period', () => {
		vi.useFakeTimers();
		try {
			const interval = element('source', ElementType.Interval, { period: 1_000 });
			const events: FlowValueEvent[] = [];
			const model = createSimulationModel(
				'source',
				[interval, subscriber('subscriber')],
				[connectLine('source-subscriber', output('source'), input('subscriber'))],
			);
			new ObservableSimulation(model).start({ next: (event) => events.push(event) });

			vi.advanceTimersByTime(3_100);

			expect(events.map((event) => event.value)).toEqual(['0', '1', '2']);
		} finally {
			vi.useRealTimers();
		}
	});

	it('range: should emit a sequence of numbers based on start and count properties', () => {
		const range = element('source', ElementType.Range, { start: 5, count: 3 });
		const result = runSimulation(
			'source',
			[range, subscriber('subscriber')],
			[connectLine('source-subscriber', output('source'), input('subscriber'))],
		);

		expect(nextValues(result, 'source')).toEqual(['5', '6', '7']);
		expect(result.completed).toBe(true);
	});

	it('throwError: should throw an error event containing the error defined by errorOrErrorFactory', () => {
		const throwError = element('source', ElementType.ThrowError, {
			errorOrErrorFactory: 'function errorFactory() { return new Error("boom"); }',
		});
		const catchError = element('catchError', ElementType.CatchError, {
			selectorExpression: 'function selector() { return createObservable(); }',
		});

		const result = runSimulation(
			'source',
			[
				throwError,
				catchError,
				ofElement('reference', ['fallback']),
				subscriber('subscriber'),
				subscriber('referenceSubscriber'),
			],
			[
				connectLine('source-catchError', output('source'), input('catchError')),
				connectLine('catchError-subscriber', output('catchError'), input('subscriber'), 1),
				connectLine('catchError-reference', eventPoint('catchError'), input('reference')),
				connectLine(
					'reference-subscriber',
					output('reference'),
					input('referenceSubscriber'),
					2,
				),
			],
		);

		const errorEvent = eventsFrom(result, 'source').find(
			(event) => event.type === FlowValueType.Error,
		);
		expect(errorEvent).toMatchObject({
			value: 'Error: boom',
			targetElementId: 'catchError',
		});
		expect(nextValues(result, 'catchError')).toEqual(['fallback']);
	});

	it('timer: should emit after startDue and then periodically based on intervalDuration', () => {
		vi.useFakeTimers();
		try {
			const timer = element('source', ElementType.Timer, {
				dueDateType: 0,
				startDue: 1_000,
				intervalDuration: 500,
			});
			const events: FlowValueEvent[] = [];
			const model = createSimulationModel(
				'source',
				[timer, subscriber('subscriber')],
				[connectLine('source-subscriber', output('source'), input('subscriber'))],
			);
			new ObservableSimulation(model).start({ next: (event) => events.push(event) });

			vi.advanceTimersByTime(2_100);

			expect(events.map((event) => event.value)).toEqual(['0', '1', '2']);
		} finally {
			vi.useRealTimers();
		}
	});

	it('timer: should complete after a single emission when intervalDuration is negative', () => {
		vi.useFakeTimers();
		try {
			const timer = element('source', ElementType.Timer, {
				dueDateType: 0,
				startDue: 1_000,
				intervalDuration: -1,
			});
			const events: FlowValueEvent[] = [];
			let completed = false;
			const model = createSimulationModel(
				'source',
				[timer, subscriber('subscriber')],
				[connectLine('source-subscriber', output('source'), input('subscriber'))],
			);
			new ObservableSimulation(model).start({
				next: (event) => events.push(event),
				complete: () => {
					completed = true;
				},
			});

			vi.advanceTimersByTime(2_100);

			expect(events.map((event) => event.value)).toEqual(['0']);
			expect(completed).toBe(true);
		} finally {
			vi.useRealTimers();
		}
	});

	it('ajax: should map successful ajax responses to FlowValues', () => {
		ajaxMock.mockReturnValue(of('ajax-result'));
		const ajax = element('source', ElementType.Ajax, {
			url: 'https://example.com/api',
			method: HttpMethod.Get,
		});

		const result = runSimulation(
			'source',
			[ajax, subscriber('subscriber')],
			[connectLine('source-subscriber', output('source'), input('subscriber'))],
		);

		expect(ajaxMock).toHaveBeenCalledWith(
			expect.objectContaining({ url: 'https://example.com/api', method: HttpMethod.Get }),
		);
		expect(nextValues(result, 'source')).toEqual(['ajax-result']);
		expect(result.completed).toBe(true);
	});

	it('ajax: should parse body JSON correctly', () => {
		ajaxMock.mockReturnValue(of('ok'));
		const ajax = element('source', ElementType.Ajax, {
			url: 'https://example.com/api',
			method: HttpMethod.Post,
			body: '{"page":1}',
		});

		runSimulation(
			'source',
			[ajax, subscriber('subscriber')],
			[connectLine('source-subscriber', output('source'), input('subscriber'))],
		);

		expect(ajaxMock).toHaveBeenCalledWith(expect.objectContaining({ body: { page: 1 } }));
	});

	it('ajax: should throw InvalidElementPropertyValueError if body is invalid JSON', () => {
		const ajax = element('source', ElementType.Ajax, {
			url: 'https://example.com/api',
			method: HttpMethod.Post,
			body: '{invalid',
		});

		let thrown: unknown = null;
		try {
			runSimulation(
				'source',
				[ajax, subscriber('subscriber')],
				[connectLine('source-subscriber', output('source'), input('subscriber'))],
			);
		} catch (error) {
			thrown = error;
		}

		expect(thrown).toBeInstanceOf(InvalidElementPropertyValueError);
		expect((thrown as InvalidElementPropertyValueError).elementId).toBe('source');
		expect((thrown as InvalidElementPropertyValueError).propertyKey).toBe('body');
	});
});
