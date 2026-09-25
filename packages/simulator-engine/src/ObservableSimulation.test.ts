import { describe, expect, it, vi } from 'vitest';
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

	it('should unsubscribe from the simulation and trigger cleanup', () => {
		vi.useFakeTimers();
		try {
			const intervalSource: Element = {
				id: 'interval',
				type: ElementType.Interval,
				name: 'interval',
				x: 0,
				y: 0,
				visible: true,
				properties: { period: 1_000 },
			};
			const model = createSimulationModel(
				intervalSource.id,
				[intervalSource, subscriber],
				[
					{
						id: 'interval-to-subscriber',
						source: {
							id: intervalSource.id,
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
					},
				],
			);
			const events: FlowValueEvent[] = [];
			const subscription = new ObservableSimulation(model).start({
				next: (event) => events.push(event),
			});

			vi.advanceTimersByTime(2_500);
			expect(events.map((event) => event.value)).toEqual(['0', '1']);

			subscription.unsubscribe();
			vi.advanceTimersByTime(5_000);
			expect(events.map((event) => event.value)).toEqual(['0', '1']);
		} finally {
			vi.useRealTimers();
		}
	});

	it('should handle restart properly by creating a fresh execution', () => {
		const model = createSimulationModel(source.id, [source, subscriber], [connection]);
		const simulation = new ObservableSimulation(model);
		const firstRun: FlowValueEvent[] = [];
		simulation.start({
			next: (event) => firstRun.push(event),
		});
		simulation.stop();

		const secondRun: FlowValueEvent[] = [];
		simulation.start({
			next: (event) => secondRun.push(event),
		});
		simulation.stop();

		expect(firstRun.map((event) => event.value)).toEqual(['1', '2']);
		expect(secondRun.map((event) => event.value)).toEqual(['1', '2']);
		expect(firstRun.map((event) => event.id)).not.toEqual(
			secondRun.map((event) => event.id),
		);
	});
});
