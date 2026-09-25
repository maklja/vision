import { describe, expect, it, vi } from 'vitest';
import {
	ConnectLine,
	ConnectPointPosition,
	ConnectPointType,
	Element,
	ElementProps,
	ElementType,
	FlowValueType,
	ObservableInputsType,
} from '@maklja/vision-simulator-model';
import { createSimulationModel, ObservableSimulation } from '../ObservableSimulation';
import { FlowValueEvent } from '../context';

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

function joinGraph(join: Element, left: Element, right: Element): SimulationResult {
	return runSimulation(
		join.id,
		[
			join,
			left,
			right,
			subscriber('subscriber'),
			subscriber('leftSubscriber'),
			subscriber('rightSubscriber'),
		],
		[
			connectLine('join-subscriber', output(join.id), input('subscriber')),
			connectLine(
				'join-left',
				eventPoint(join.id, ConnectPointPosition.Top),
				input(left.id),
				1,
				'left',
			),
			connectLine(
				'join-right',
				eventPoint(join.id, ConnectPointPosition.Bottom),
				input(right.id),
				2,
				'right',
			),
			connectLine('left-subscriber', output(left.id), input('leftSubscriber'), 0),
			connectLine('right-subscriber', output(right.id), input('rightSubscriber'), 0),
		],
	);
}

function joinWithOfInputs(type: ElementType, properties: ElementProps): SimulationResult {
	return joinGraph(
		element('join', type, properties),
		ofElement('left', [1, 2, 3]),
		ofElement('right', [10, 20]),
	);
}

describe('joinCreationOperatorFactory', () => {
	it('combineLatest: should combine the latest values of multiple reference observables', () => {
		const result = joinWithOfInputs(ElementType.CombineLatest, {
			observableInputsType: ObservableInputsType.Array,
		});

		expect(nextValues(result, 'join')).toEqual(['3,10', '3,20']);
		expect(
			eventsFrom(result, 'join').filter((event) => event.type === FlowValueType.Subscribe),
		).toHaveLength(2);
		expect(result.completed).toBe(true);
	});

	it('combineLatest: should emit named dependencies in object input mode', () => {
		const result = joinWithOfInputs(ElementType.CombineLatest, {
			observableInputsType: ObservableInputsType.Object,
		});

		const joinEvents = eventsFrom(result, 'join').filter(
			(event) => event.type === FlowValueType.Next,
		);
		expect(joinEvents.map((event) => event.value)).toEqual([
			'[object Object]',
			'[object Object]',
		]);
		expect(joinEvents.map((event) => event.dependencies.length)).toEqual([2, 2]);
	});

	it('concat: should concatenate multiple reference observables sequentially', () => {
		const result = joinWithOfInputs(ElementType.Concat, {});

		expect(nextValues(result, 'join')).toEqual(['1', '2', '3', '10', '20']);
		const joinEvents = eventsFrom(result, 'join');
		expect(joinEvents[0]).toMatchObject({ type: FlowValueType.Subscribe, value: 'null' });
		expect(result.completed).toBe(true);
	});

	it('forkJoin: should wait for all reference observables to complete and emit their last values', () => {
		const result = joinWithOfInputs(ElementType.ForkJoin, {
			observableInputsType: ObservableInputsType.Array,
		});

		expect(nextValues(result, 'join')).toEqual(['3,20']);
		expect(
			eventsFrom(result, 'join').filter((event) => event.type === FlowValueType.Next),
		).toHaveLength(1);
	});

	it('merge: should merge emissions from multiple reference observables concurrently', () => {
		const result = joinWithOfInputs(ElementType.Merge, { limitConcurrent: 0 });

		expect(nextValues(result, 'join')).toEqual(['1', '2', '3', '10', '20']);
		expect(eventsFrom(result, 'join')[0]).toMatchObject({
			type: FlowValueType.Subscribe,
			targetElementId: 'left',
		});
	});

	it('merge: should interleave emissions from time-based reference observables', () => {
		vi.useFakeTimers();
		try {
			const interval = (id: string) => element(id, ElementType.Interval, { period: 1_000 });
			const result = joinGraph(
				element('join', ElementType.Merge, { limitConcurrent: 0 }),
				interval('left'),
				interval('right'),
			);

			vi.advanceTimersByTime(2_100);

			expect(nextValues(result, 'join')).toEqual(['0', '0', '1', '1']);
		} finally {
			vi.useRealTimers();
		}
	});

	it('race: should mirror the first reference observable to emit a value', () => {
		const result = joinWithOfInputs(ElementType.Race, {});

		expect(nextValues(result, 'join')).toEqual(['1', '2', '3']);
		expect(
			eventsFrom(result, 'join').filter((event) => event.type === FlowValueType.Subscribe),
		).toHaveLength(1);
	});

	it('race: should ignore the losing reference observable after a winner is chosen', () => {
		vi.useFakeTimers();
		try {
			const result = joinGraph(
				element('join', ElementType.Race, {}),
				element('left', ElementType.Interval, { period: 1_000 }),
				element('right', ElementType.Interval, { period: 2_000 }),
			);

			vi.advanceTimersByTime(2_100);

			expect(nextValues(result, 'join')).toEqual(['0', '1']);
		} finally {
			vi.useRealTimers();
		}
	});

	it('zip: should zip values from multiple reference observables strictly by index', () => {
		const result = joinWithOfInputs(ElementType.Zip, {});

		expect(nextValues(result, 'join')).toEqual(['1,10', '2,20']);
		expect(
			eventsFrom(result, 'join').filter((event) => event.type === FlowValueType.Subscribe),
		).toHaveLength(2);
	});
});
