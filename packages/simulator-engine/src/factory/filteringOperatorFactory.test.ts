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

function element(id: string, type: ElementType, properties: ElementProps = {}): Element {
	return { id, type, name: id, x: 0, y: 0, visible: true, properties };
}

function connectLine(id: string, sourceId: string, targetId: string, index = 0): ConnectLine {
	return {
		id,
		source: {
			id: sourceId,
			connectPointType: ConnectPointType.Output,
			connectPosition: ConnectPointPosition.Right,
		},
		target: {
			id: targetId,
			connectPointType: ConnectPointType.Input,
			connectPosition: ConnectPointPosition.Left,
		},
		points: [],
		locked: false,
		index,
		name: '',
	};
}

const subscriber = (id: string) => element(id, ElementType.Subscriber);
const ofElement = (id: string, values: unknown[]) =>
	element(id, ElementType.Of, {
		argsFactoryExpression: `function argsFactory() { return ${JSON.stringify(values)}; }`,
	});

function runFilter(predicateExpression: string): FlowValueEvent[] {
	const filter = element('operator', ElementType.Filter, { predicateExpression });
	const events: FlowValueEvent[] = [];
	const model = createSimulationModel(
		'source',
		[ofElement('source', [1, 2, 3, 4]), filter, subscriber('subscriber')],
		[
			connectLine('source-operator', 'source', 'operator'),
			connectLine('operator-subscriber', 'operator', 'subscriber', 1),
		],
	);
	new ObservableSimulation(model).start({ next: (event) => events.push(event) });

	return events;
}

function filteredValues(events: FlowValueEvent[]): string[] {
	return events
		.filter(
			(event) => event.sourceElementId === 'operator' && event.type === FlowValueType.Next,
		)
		.map((event) => event.value);
}

describe('filteringOperatorFactory', () => {
	it('filter: should drop values that do not satisfy the predicateExpression', () => {
		const events = runFilter('function predicate(value) { return value % 2 === 0; }');

		expect(filteredValues(events)).toEqual(['2', '4']);
	});

	it('filter: should emit values that satisfy the predicateExpression', () => {
		const events = runFilter('function predicate(value) { return value > 2; }');

		expect(filteredValues(events)).toEqual(['3', '4']);
	});
});
