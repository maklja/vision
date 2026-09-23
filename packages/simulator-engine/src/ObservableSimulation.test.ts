import { describe, expect, it } from 'vitest';
import {
	ConnectLine,
	ConnectPointPosition,
	ConnectPointType,
	Element,
	ElementType,
	FlowValueType,
	OfElement,
} from '@maklja/vision-simulator-model';
import { FlowValueEvent } from './context';
import { createSimulationModel, ObservableSimulation } from './ObservableSimulation';

const source: OfElement = {
	id: 'source',
	type: ElementType.Of,
	name: 'source',
	x: 0,
	y: 0,
	visible: true,
	properties: {
		argsFactoryExpression: 'function argsFactory() { return [1, 2]; }',
	},
};

const subscriber: Element = {
	id: 'subscriber',
	type: ElementType.Subscriber,
	name: 'subscriber',
	x: 100,
	y: 0,
	visible: true,
	properties: {},
};

const connection: ConnectLine = {
	id: 'source-to-subscriber',
	source: {
		id: source.id,
		connectPointType: ConnectPointType.Output,
		connectPosition: ConnectPointPosition.Right,
	},
	target: {
		id: subscriber.id,
		connectPointType: ConnectPointType.Input,
		connectPosition: ConnectPointPosition.Left,
	},
	points: [],
	locked: false,
	index: 0,
	name: '',
};

describe('ObservableSimulation', () => {
	it('reports values flowing from an entry operator to a subscriber', () => {
		const model = createSimulationModel(source.id, [source, subscriber], [connection]);
		const events: FlowValueEvent[] = [];
		let completed = false;

		const subscription = new ObservableSimulation(model).start({
			next: (event) => events.push(event),
			complete: () => {
				completed = true;
			},
		});

		expect(events.map((event) => event.value)).toEqual(['1', '2']);
		expect(events.every((event) => event.type === FlowValueType.Next)).toBe(true);
		expect(events.map((event) => event.sourceElementId)).toEqual([source.id, source.id]);
		expect(events.map((event) => event.targetElementId)).toEqual([
			subscriber.id,
			subscriber.id,
		]);
		expect(completed).toBe(true);

		subscription.unsubscribe();
	});
});
