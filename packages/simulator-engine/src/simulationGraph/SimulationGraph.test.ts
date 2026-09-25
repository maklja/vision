import { describe, expect, it } from 'vitest';
import {
	ConnectLine,
	ConnectPointPosition,
	ConnectPointType,
	Element,
	ElementProps,
	ElementType,
} from '@maklja/vision-simulator-model';
import { MissingNextElementError } from '../errors';
import { GraphNodeType, SimulationGraph } from './SimulationGraph';

function element(id: string, type: ElementType, properties: ElementProps = {}): Element {
	return { id, type, name: id, x: 0, y: 0, visible: true, properties };
}

function connectLine(
	id: string,
	source: [string, ConnectPointType, ConnectPointPosition],
	target: [string, ConnectPointType, ConnectPointPosition],
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

const outputConnectPoint: [ConnectPointType, ConnectPointPosition] = [
	ConnectPointType.Output,
	ConnectPointPosition.Right,
];
const inputConnectPoint: [ConnectPointType, ConnectPointPosition] = [
	ConnectPointType.Input,
	ConnectPointPosition.Left,
];
const eventConnectPoint: [ConnectPointType, ConnectPointPosition] = [
	ConnectPointType.Event,
	ConnectPointPosition.Top,
];

function createGraph(elements: Element[], connectLines: ConnectLine[]): SimulationGraph {
	const elementsMap = elements.reduce(
		(map, el) => map.set(el.id, el),
		new Map<string, Element>(),
	);
	const connectLinesMap = connectLines.reduce((map, cl) => {
		const lines = map.get(cl.source.id) ?? [];
		return map.set(cl.source.id, [...lines, cl]);
	}, new Map<string, ConnectLine[]>());

	return new SimulationGraph(elementsMap, connectLinesMap);
}

function createLinearGraph(): SimulationGraph {
	const source = element('source', ElementType.Of, {
		argsFactoryExpression: 'function argsFactory() { return [1, 2, 3]; }',
	});
	const pipe = element('pipe', ElementType.Map, {
		projectExpression: 'function project(value) { return value; }',
	});
	const subscriber = element('subscriber', ElementType.Subscriber);

	return createGraph(
		[source, pipe, subscriber],
		[
			connectLine(
				'source-pipe',
				['source', ...outputConnectPoint],
				['pipe', ...inputConnectPoint],
			),
			connectLine(
				'pipe-subscriber',
				['pipe', ...outputConnectPoint],
				['subscriber', ...inputConnectPoint],
			),
		],
	);
}

function captureError(callback: () => unknown): unknown {
	try {
		callback();
	} catch (error) {
		return error;
	}

	return null;
}

describe('SimulationGraph', () => {
	it('should create a valid graph for a linear flow (Entry -> Pipe -> Subscriber)', () => {
		const branches = createLinearGraph().createObservableGraph('source');

		expect([...branches.keys()]).toEqual(['source']);
		const branch = branches.get('source');
		expect(branch?.nodes.map((node) => node.id)).toEqual(['source', 'pipe', 'subscriber']);
		expect([...(branch?.refNodeIds ?? [])]).toEqual([]);
		expect(branch?.nodes[0].edges).toEqual([
			{
				id: 'source-pipe',
				type: GraphNodeType.Direct,
				sourceNodeId: 'source',
				targetNodeId: 'pipe',
			},
		]);
	});

	it('should create multiple branches for a graph with event inputs', () => {
		const source = element('source', ElementType.Of, {
			argsFactoryExpression: 'function argsFactory() { return [1, 2, 3]; }',
		});
		const buffer = element('buffer', ElementType.Buffer);
		const reference = element('reference', ElementType.Of, {
			argsFactoryExpression: 'function argsFactory() { return ["x"]; }',
		});
		const subscriber = element('subscriber', ElementType.Subscriber);
		const referenceSubscriber = element('referenceSubscriber', ElementType.Subscriber);

		const graph = createGraph(
			[source, buffer, reference, subscriber, referenceSubscriber],
			[
				connectLine(
					'source-buffer',
					['source', ...outputConnectPoint],
					['buffer', ...inputConnectPoint],
				),
				connectLine(
					'buffer-subscriber',
					['buffer', ...outputConnectPoint],
					['subscriber', ...inputConnectPoint],
				),
				connectLine(
					'buffer-reference',
					['buffer', ...eventConnectPoint],
					['reference', ...inputConnectPoint],
				),
				connectLine(
					'reference-subscriber',
					['reference', ...outputConnectPoint],
					['referenceSubscriber', ...inputConnectPoint],
				),
			],
		);

		const branches = graph.createObservableGraph('source');

		expect([...branches.keys()]).toEqual(['source', 'reference']);
		const sourceBranch = branches.get('source');
		expect(sourceBranch?.nodes.map((node) => node.id)).toEqual([
			'source',
			'buffer',
			'subscriber',
		]);
		expect([...(sourceBranch?.refNodeIds ?? [])]).toEqual(['reference']);
		const referenceBranch = branches.get('reference');
		expect(referenceBranch?.nodes.map((node) => node.id)).toEqual([
			'reference',
			'referenceSubscriber',
		]);
		expect([...(referenceBranch?.refNodeIds ?? [])]).toEqual([]);
	});

	it('should throw an error when an element ID cannot be found', () => {
		const error = captureError(() => createLinearGraph().createObservableGraph('missing'));

		expect(error).toBeInstanceOf(Error);
		expect((error as Error).message).toBe('Element with id missing was not found');
	});

	it('should throw MissingNextElementError when a pipe operator has no outgoing connections', () => {
		const source = element('source', ElementType.Of, {
			argsFactoryExpression: 'function argsFactory() { return [1, 2, 3]; }',
		});
		const pipe = element('pipe', ElementType.Map, {
			projectExpression: 'function project(value) { return value; }',
		});
		const graph = createGraph(
			[source, pipe],
			[
				connectLine(
					'source-pipe',
					['source', ...outputConnectPoint],
					['pipe', ...inputConnectPoint],
				),
			],
		);

		const error = captureError(() => graph.createObservableGraph('source'));

		expect(error).toBeInstanceOf(MissingNextElementError);
		expect((error as MissingNextElementError).elementId).toBe('pipe');
	});

	it('should throw an error when an operator has multiple direct outgoing edges instead of one', () => {
		const source = element('source', ElementType.Of, {
			argsFactoryExpression: 'function argsFactory() { return [1, 2, 3]; }',
		});
		const pipe = element('pipe', ElementType.Map, {
			projectExpression: 'function project(value) { return value; }',
		});
		const subscriber = element('subscriber', ElementType.Subscriber);
		const graph = createGraph(
			[source, pipe, subscriber],
			[
				connectLine(
					'source-pipe',
					['source', ...outputConnectPoint],
					['pipe', ...inputConnectPoint],
				),
				connectLine(
					'source-subscriber',
					['source', ...outputConnectPoint],
					['subscriber', ...inputConnectPoint],
				),
			],
		);

		const error = captureError(() => graph.createObservableGraph('source'));

		expect(error).toBeInstanceOf(Error);
		expect((error as Error).message).toBe('Unexpected number(2) direct edges');
	});
});
