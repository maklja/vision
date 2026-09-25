import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	ConnectLine,
	ConnectPointPosition,
	ConnectPointType,
	Element,
	ElementProps,
	ElementType,
	FlowValueType,
} from '@maklja/vision-simulator-model';
import { FlowValueEvent } from './context';
import {
	ObservableSimulationMessageType,
	startObservableSimulation,
} from './startObservableSimulation';

type Listener = (event: unknown) => void;

class FakeWorker {
	static instances: FakeWorker[] = [];

	static reset() {
		FakeWorker.instances = [];
	}

	readonly postMessage = vi.fn();
	readonly terminate = vi.fn();
	private readonly listeners = new Map<string, Listener[]>();

	constructor(
		readonly url: URL,
		readonly options?: WorkerOptions,
	) {
		FakeWorker.instances.push(this);
	}

	addEventListener(type: string, listener: Listener): void {
		const listeners = this.listeners.get(type) ?? [];
		this.listeners.set(type, [...listeners, listener]);
	}

	dispatch(type: string, payload: unknown): void {
		(this.listeners.get(type) ?? []).forEach((listener) => listener(payload));
	}
}

function element(id: string, type: ElementType, properties: ElementProps = {}): Element {
	return { id, type, name: id, x: 0, y: 0, visible: true, properties };
}

function link(id: string, sourceId: string, targetId: string, index = 0): ConnectLine {
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

const source = element('source', ElementType.Of, {
	argsFactoryExpression: 'function argsFactory() { return [1, 2]; }',
});
const subscriber = element('subscriber', ElementType.Subscriber);
const elements: Element[] = [source, subscriber];
const connectLines: ConnectLine[] = [link('source-subscriber', 'source', 'subscriber')];

const nextEvent: FlowValueEvent = {
	id: 'flow-1',
	subscribeId: null,
	dependencies: [],
	index: 1,
	value: '1',
	hash: 'hash-1',
	type: FlowValueType.Next,
	connectLinesId: ['source-subscriber'],
	sourceElementId: 'source',
	targetElementId: 'subscriber',
};

describe('startObservableSimulation', () => {
	beforeEach(() => {
		FakeWorker.reset();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it('should initialize simulation using the fallback main thread when Worker is unavailable', () => {
		vi.stubGlobal('window', {});
		vi.stubGlobal('Worker', undefined);
		const events: FlowValueEvent[] = [];
		let completed = false;

		const subscription = startObservableSimulation({
			entryElementId: 'source',
			elements,
			connectLines,
			onNext: (event) => events.push(event),
			onComplete: () => {
				completed = true;
			},
		});

		expect(events.map((event) => event.value)).toEqual(['1', '2']);
		expect(events.every((event) => event.sourceElementId === 'source')).toBe(true);
		expect(completed).toBe(true);

		subscription.unsubscribe();
	});

	it('should instantiate the Worker, send startSimulation, and process structured-cloned FlowValueEvents messages', () => {
		vi.stubGlobal('window', { Worker: FakeWorker });
		vi.stubGlobal('Worker', FakeWorker);
		const events: FlowValueEvent[] = [];
		const errors: FlowValueEvent[] = [];
		const creationErrors: unknown[] = [];
		let completed = false;

		startObservableSimulation({
			entryElementId: 'source',
			elements,
			connectLines,
			onNext: (event) => events.push(event),
			onError: (event) => errors.push(event),
			onComplete: () => {
				completed = true;
			},
			onCreationError: (event) => creationErrors.push(event),
		});

		expect(FakeWorker.instances).toHaveLength(1);
		const worker = FakeWorker.instances[0];
		expect(worker.url.pathname.endsWith('observableSimulationWorker.ts')).toBe(true);
		expect(worker.options).toEqual({ name: 'ObservableWorker', type: 'module' });
		expect(worker.postMessage).toHaveBeenCalledWith({
			type: ObservableSimulationMessageType.StartSimulation,
			entryElementId: 'source',
			elements,
			connectLines,
		});

		worker.dispatch('message', {
			data: { type: ObservableSimulationMessageType.Next, value: nextEvent },
		});
		expect(events).toEqual([nextEvent]);

		worker.dispatch('message', {
			data: { type: ObservableSimulationMessageType.Error, value: nextEvent },
		});
		expect(errors).toEqual([nextEvent]);

		worker.dispatch('message', { data: { type: ObservableSimulationMessageType.Complete } });
		expect(completed).toBe(true);

		worker.dispatch('message', {
			data: {
				type: ObservableSimulationMessageType.CreationError,
				value: { id: 'error-1', sourceElementId: 'source', value: 'boom' },
			},
		});
		expect(creationErrors).toEqual([
			{ elementId: 'source', errorId: 'error-1', errorMessage: 'boom' },
		]);
	});

	it('should notify the creation error callback when the main thread simulation cannot be created', () => {
		vi.stubGlobal('window', {});
		vi.stubGlobal('Worker', undefined);
		const buffer = element('buffer', ElementType.Buffer);
		const creationErrors: unknown[] = [];

		expect(() =>
			startObservableSimulation({
				entryElementId: 'source',
				elements: [source, buffer, subscriber],
				connectLines: [
					link('source-buffer', 'source', 'buffer'),
					link('buffer-subscriber', 'buffer', 'subscriber', 1),
				],
				onCreationError: (event) => creationErrors.push(event),
			}),
		).toThrow('Reference observable is required for buffer operator');

		expect(creationErrors).toHaveLength(1);
		expect(creationErrors[0]).toMatchObject({ elementId: 'buffer' });
	});

	it('should correctly stop the simulation by posting stopSimulation message to Worker', () => {
		vi.stubGlobal('window', { Worker: FakeWorker });
		vi.stubGlobal('Worker', FakeWorker);

		const subscription = startObservableSimulation({
			entryElementId: 'source',
			elements,
			connectLines,
		});
		const worker = FakeWorker.instances[0];

		subscription.unsubscribe();

		expect(worker.postMessage).toHaveBeenLastCalledWith({
			type: ObservableSimulationMessageType.StopSimulation,
		});
		expect(worker.terminate).toHaveBeenCalledTimes(1);
	});

	it('should terminate the Worker when it reports a runtime error', () => {
		vi.stubGlobal('window', { Worker: FakeWorker });
		vi.stubGlobal('Worker', FakeWorker);
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

		startObservableSimulation({ entryElementId: 'source', elements, connectLines });
		const worker = FakeWorker.instances[0];

		worker.dispatch('error', new Error('worker failed'));

		expect(worker.terminate).toHaveBeenCalledTimes(1);
		expect(consoleError).toHaveBeenCalled();
	});
});
