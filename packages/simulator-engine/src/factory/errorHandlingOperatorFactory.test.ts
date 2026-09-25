import { describe, expect, it } from 'vitest';
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
): ConnectLine {
	return {
		id,
		source: { id: source[0], connectPointType: source[1], connectPosition: source[2] },
		target: { id: target[0], connectPointType: target[1], connectPosition: target[2] },
		points: [],
		locked: false,
		index,
		name: '',
	};
}

const output = (id: string): ConnectPoint => [
	id,
	ConnectPointType.Output,
	ConnectPointPosition.Right,
];
const input = (id: string): ConnectPoint => [id, ConnectPointType.Input, ConnectPointPosition.Left];
const eventPoint = (id: string): ConnectPoint => [
	id,
	ConnectPointType.Event,
	ConnectPointPosition.Top,
];

const subscriber = (id: string) => element(id, ElementType.Subscriber);
const ofElement = (id: string, values: unknown[]) =>
	element(id, ElementType.Of, {
		argsFactoryExpression: `function argsFactory() { return ${JSON.stringify(values)}; }`,
	});

function runCatchError(): FlowValueEvent[] {
	const map = element('map', ElementType.Map, {
		projectExpression:
			'function project(value) { if (value === 2) { throw new Error("boom"); } return value; }',
	});
	const catchError = element('catchError', ElementType.CatchError, {
		selectorExpression: 'function selector(err, caught) { return createObservable(); }',
	});
	const events: FlowValueEvent[] = [];
	const model = createSimulationModel(
		'source',
		[
			ofElement('source', [1, 2, 3]),
			map,
			catchError,
			ofElement('reference', ['fallback']),
			subscriber('subscriber'),
			subscriber('referenceSubscriber'),
		],
		[
			connectLine('source-map', output('source'), input('map')),
			connectLine('map-catchError', output('map'), input('catchError'), 1),
			connectLine('catchError-subscriber', output('catchError'), input('subscriber'), 2),
			connectLine('catchError-reference', eventPoint('catchError'), input('reference'), 3),
			connectLine(
				'reference-subscriber',
				output('reference'),
				input('referenceSubscriber'),
				4,
			),
		],
	);
	new ObservableSimulation(model).start({ next: (event) => events.push(event) });

	return events;
}

describe('errorHandlingOperatorFactory', () => {
	it('catchError: should intercept an error from upstream and switch to the fallback reference observable', () => {
		const events = runCatchError();

		const errorEvent = events.find((event) => event.type === FlowValueType.Error);
		expect(errorEvent).toMatchObject({
			value: 'Error: boom',
			sourceElementId: 'map',
			targetElementId: 'catchError',
			connectLinesId: ['map-catchError'],
		});

		const catchErrorEvents = events.filter((event) => event.sourceElementId === 'catchError');
		expect(catchErrorEvents[0]).toMatchObject({
			type: FlowValueType.Subscribe,
			value: 'null',
			targetElementId: 'reference',
		});
		expect(
			catchErrorEvents
				.filter((event) => event.type === FlowValueType.Next)
				.map((event) => event.value),
		).toEqual(['fallback']);
	});

	it('catchError: should buffer the flow path across an error handler target', () => {
		const events = runCatchError();

		const passthroughEvent = events.find(
			(event) =>
				event.type === FlowValueType.Next &&
				event.value === '1' &&
				event.sourceElementId === 'map',
		);
		expect(passthroughEvent).toMatchObject({
			sourceElementId: 'map',
			targetElementId: 'subscriber',
			connectLinesId: ['map-catchError', 'catchError-subscriber'],
		});
	});

	it('catchError: should propagate the error if no fallback reference is provided', () => {
		const catchError = element('catchError', ElementType.CatchError, {
			selectorExpression: 'function selector(err, caught) { return createObservable(); }',
		});

		expect(() => {
			const model = createSimulationModel(
				'source',
				[ofElement('source', [1, 2]), catchError, subscriber('subscriber')],
				[
					connectLine('source-catchError', output('source'), input('catchError')),
					connectLine(
						'catchError-subscriber',
						output('catchError'),
						input('subscriber'),
						1,
					),
				],
			);
			new ObservableSimulation(model).start({});
		}).toThrow(MissingReferenceObservableError);
	});
});
