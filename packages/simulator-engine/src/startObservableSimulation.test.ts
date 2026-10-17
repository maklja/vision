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

	readonly postMessage = vi.fn((message: unknown) => structuredClone(message));
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

describe('startObservableSimulation trusted execution', () => {
	beforeEach(() => {
		FakeWorker.reset();
		vi.useFakeTimers();
	});
	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});
	function launch(extra: Partial<Parameters<typeof startObservableSimulation>[0]> = {}) {
		vi.stubGlobal('Worker', FakeWorker);
		return startObservableSimulation({
			entryElementId: 'source',
			elements,
			connectLines,
			trusted: true,
			...extra,
		});
	}
	function send(type: ObservableSimulationMessageType, value?: unknown, runId?: string) {
		const worker = FakeWorker.instances.at(-1)!;
		const start = worker.postMessage.mock.calls[0][0] as { runId: string };
		worker.dispatch('message', { data: { type, runId: runId ?? start.runId, value } });
	}
	it('requires explicit trust and never starts a Worker before approval', () => {
		const onCreationError = vi.fn();
		launch({ trusted: false, onCreationError });
		expect(FakeWorker.instances).toHaveLength(0);
		expect(onCreationError).toHaveBeenCalledOnce();
	});
	it('rejects authored code on the main thread even with trust', () => {
		vi.stubGlobal('Worker', undefined);
		const onDiagnostic = vi.fn();
		startObservableSimulation({
			entryElementId: 'source',
			elements,
			connectLines,
			trusted: true,
			onDiagnostic,
		});
		expect(onDiagnostic.mock.calls[0][0]).toMatchObject({ category: 'policy' });
	});
	it('retains a visible literal-only fallback', () => {
		vi.stubGlobal('Worker', undefined);
		const onNext = vi.fn(),
			onDiagnostic = vi.fn();
		const subscription = startObservableSimulation({
			entryElementId: 'source',
			elements: [element('source', ElementType.Range, { start: 0, count: 2 }), subscriber],
			connectLines,
			onNext,
			onDiagnostic,
		});
		expect(onNext).toHaveBeenCalledTimes(2);
		expect(onDiagnostic.mock.calls[0][0].message).toContain('literal-only');
		subscription.unsubscribe();
	});
	it('preflights malformed code without executing a source or allocating a Worker', () => {
		const onDiagnostic = vi.fn();
		launch({
			elements: [
				element('source', ElementType.Of, { argsFactoryExpression: '() =>' }),
				subscriber,
			],
			onDiagnostic,
		});
		expect(FakeWorker.instances).toHaveLength(0);
		expect(onDiagnostic.mock.calls[0][0]).toMatchObject({
			category: 'compile',
			elementId: 'source',
			field: 'argsFactoryExpression',
		});
	});
	it('transfers cloneable seed and correlates events, ignoring stale and stopped runs', () => {
		const onNext = vi.fn(),
			onError = vi.fn(),
			onComplete = vi.fn();
		const subscription = launch({ onNext, onError, onComplete, contextSeed: { seen: 0 } });
		const worker = FakeWorker.instances[0];
		expect(worker.postMessage.mock.calls[0][0]).toMatchObject({ contextSeed: { seen: 0 } });
		send(ObservableSimulationMessageType.Next, nextEvent, 'old-run');
		expect(onNext).not.toHaveBeenCalled();
		send(ObservableSimulationMessageType.Next, nextEvent);
		expect(onNext).toHaveBeenCalledWith(nextEvent);
		expect(onError).not.toHaveBeenCalled();
		subscription.unsubscribe();
		subscription.unsubscribe();
		send(ObservableSimulationMessageType.Next, nextEvent);
		expect(onNext).toHaveBeenCalledOnce();
		expect(worker.terminate).toHaveBeenCalledOnce();
		expect(vi.getTimerCount()).toBe(0);
	});
	it('terminates a hung Worker after the default five seconds', () => {
		const onDiagnostic = vi.fn(),
			onCreationError = vi.fn();
		launch({ onDiagnostic, onCreationError });
		vi.advanceTimersByTime(5000);
		expect(FakeWorker.instances[0].terminate).toHaveBeenCalledOnce();
		expect(onDiagnostic.mock.calls[0][0]).toMatchObject({ category: 'watchdog' });
		expect(onCreationError).toHaveBeenCalledOnce();
	});
	it('accepts silent async sources while control heartbeat responds', () => {
		launch();
		for (let i = 0; i < 40; i++) {
			vi.advanceTimersByTime(250);
			send(ObservableSimulationMessageType.Heartbeat);
		}
		expect(FakeWorker.instances[0].terminate).not.toHaveBeenCalled();
		send(ObservableSimulationMessageType.Complete);
		expect(FakeWorker.instances[0].terminate).toHaveBeenCalledOnce();
		expect(vi.getTimerCount()).toBe(0);
	});
	it.each(['error', 'messageerror'])('reports %s transport failures', (type) => {
		const onDiagnostic = vi.fn();
		launch({ onDiagnostic });
		FakeWorker.instances[0].dispatch(type, {});
		expect(onDiagnostic.mock.calls[0][0]).toMatchObject({ category: 'transport' });
		expect(FakeWorker.instances[0].terminate).toHaveBeenCalledOnce();
	});
	it.each([0, 61, NaN])('rejects an invalid watchdog %s', (watchdogSeconds) => {
		const onCreationError = vi.fn();
		launch({ watchdogSeconds, onCreationError });
		expect(FakeWorker.instances).toHaveLength(0);
		expect(onCreationError).toHaveBeenCalledOnce();
	});
});

it('releases the Worker on a terminal observable error', () => {
	vi.stubGlobal('Worker', FakeWorker);
	const onError = vi.fn();
	startObservableSimulation({
		entryElementId: 'source',
		elements,
		connectLines,
		trusted: true,
		onError,
	});
	const worker = FakeWorker.instances.at(-1)!;
	const start = worker.postMessage.mock.calls[0][0] as { runId: string };
	worker.dispatch('message', {
		data: { type: ObservableSimulationMessageType.Error, runId: start.runId, value: nextEvent },
	});
	expect(onError).toHaveBeenCalledWith(nextEvent);
	expect(worker.terminate).toHaveBeenCalledOnce();
	vi.unstubAllGlobals();
});
