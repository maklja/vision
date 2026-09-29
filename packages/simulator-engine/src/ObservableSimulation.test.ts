import { describe, expect, it, vi } from 'vitest';
import { config } from 'rxjs';
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
			expect(vi.getTimerCount()).toBe(1);

			subscription.unsubscribe();
			expect(vi.getTimerCount()).toBe(0);

			vi.advanceTimersByTime(5_000);
			expect(events.map((event) => event.value)).toEqual(['0', '1']);
		} finally {
			vi.useRealTimers();
		}
	});

	it('reports a fatal error without leaving an unhandled RxJS error', () => {
		vi.useFakeTimers();
		const previousUnhandledErrorHandler = config.onUnhandledError;
		const onUnhandledError = vi.fn();
		config.onUnhandledError = onUnhandledError;

		try {
			const errorSource: Element = {
				id: 'error-source',
				type: ElementType.ThrowError,
				name: 'throwError',
				x: 0,
				y: 0,
				visible: true,
				properties: {
					errorOrErrorFactory: 'function errorFactory() { return new Error("boom"); }',
				},
			};
			const errorConnection: ConnectLine = {
				...connection,
				id: 'error-source-to-subscriber',
				source: { ...connection.source, id: errorSource.id },
			};
			const model = createSimulationModel(
				errorSource.id,
				[errorSource, subscriber],
				[errorConnection],
			);
			const errors: FlowValueEvent[] = [];

			new ObservableSimulation(model).start({ error: (error) => errors.push(error) });
			vi.runAllTimers();

			expect(errors).toHaveLength(1);
			expect(errors[0]).toMatchObject({
				type: FlowValueType.Error,
				value: 'Error: boom',
				sourceElementId: errorSource.id,
				targetElementId: subscriber.id,
			});
			expect(onUnhandledError).not.toHaveBeenCalled();
		} finally {
			config.onUnhandledError = previousUnhandledErrorHandler;
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
		expect(firstRun.map((event) => event.id)).not.toEqual(secondRun.map((event) => event.id));
	});
});
