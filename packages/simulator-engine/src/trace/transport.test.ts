import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
	ConnectLine,
	ConnectPointPosition,
	ConnectPointType,
	Element,
	ElementType,
} from '@maklja/vision-simulator-model';
import {
	startObservableSimulation,
	ObservableSimulationMessageType as Type,
} from '../startObservableSimulation';
import { FlowTraceEvent } from './FlowTrace';

class TestWorker {
	static current: TestWorker;
	readonly postMessage = vi.fn();
	readonly terminate = vi.fn();
	readonly listeners = new Map<string, Set<EventListener>>();
	constructor() {
		TestWorker.current = this;
	}
	addEventListener(type: string, fn: EventListener) {
		if (!this.listeners.has(type)) this.listeners.set(type, new Set());
		this.listeners.get(type)!.add(fn);
	}
	removeEventListener(type: string, fn: EventListener) {
		this.listeners.get(type)?.delete(fn);
	}
	send(data: unknown) {
		this.listeners.get('message')?.forEach((fn) => fn({ data } as MessageEvent));
	}
	get runId(): string {
		return this.postMessage.mock.calls[0][0].runId;
	}
	trace(event: object, version = 1) {
		this.send({ version, runId: this.runId, type: Type.Trace, event });
	}
}
const source: Element = {
	id: 'source',
	type: ElementType.Range,
	name: 'source',
	x: 0,
	y: 0,
	visible: true,
	properties: { start: 0, count: 2 },
};
const sink: Element = { ...source, id: 'sink', type: ElementType.Subscriber, properties: {} };
const line: ConnectLine = {
	id: 'line',
	index: 0,
	name: '',
	locked: false,
	points: [],
	source: {
		id: 'source',
		connectPointType: ConnectPointType.Output,
		connectPosition: ConnectPointPosition.Right,
	},
	target: {
		id: 'sink',
		connectPointType: ConnectPointType.Input,
		connectPosition: ConnectPointPosition.Left,
	},
};
const graph = { entryElementId: 'source', elements: [source, sink], connectLines: [line] };
function setup() {
	const events: FlowTraceEvent[] = [];
	const onNext = vi.fn(),
		onError = vi.fn(),
		onCreationError = vi.fn(),
		onDiagnostic = vi.fn(),
		onComplete = vi.fn();
	const subscription = startObservableSimulation({
		...graph,
		onTrace: (e) => events.push(e),
		onNext,
		onError,
		onCreationError,
		onDiagnostic,
		onComplete,
	});
	const worker = TestWorker.current;
	const event = (seq: number, body: object) => ({
		version: 1,
		runId: worker.runId,
		seq,
		timeMs: 0,
		eventId: `${worker.runId}:event:${seq}`,
		path: [],
		dependencies: [],
		...body,
	});
	const occurrence = {
		subscriptionId: `${worker.runId}:subscription:1`,
		parentSubscriptionId: null,
		elementId: 'source',
	};
	return {
		worker,
		events,
		event,
		occurrence,
		subscription,
		onNext,
		onError,
		onComplete,
		onCreationError,
		onDiagnostic,
	};
}
beforeEach(() => {
	vi.useFakeTimers();
	vi.stubGlobal('Worker', TestWorker);
});
afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllGlobals();
});

it('acknowledges responsive stop, ignores late values and detaches every listener', () => {
	const s = setup();
	s.worker.trace(s.event(1, { ...s.occurrence, kind: 'subscribe' }));
	s.subscription.unsubscribe();
	s.subscription.unsubscribe();
	expect(s.worker.postMessage).toHaveBeenCalledTimes(2);
	expect(s.worker.postMessage).toHaveBeenLastCalledWith({
		version: 1,
		type: Type.StopSimulation,
		runId: s.worker.runId,
	});
	expect(s.worker.terminate).not.toHaveBeenCalled();
	s.worker.trace(s.event(2, { ...s.occurrence, kind: 'unsubscribe', reason: 'run-stop' }));
	s.worker.trace(s.event(3, { kind: 'run-ended', reason: 'cancelled', teardownConfirmed: true }));
	s.worker.send({ version: 1, type: Type.Stopped, runId: s.worker.runId });
	expect(s.worker.terminate).toHaveBeenCalledOnce();
	expect([...s.worker.listeners.values()].every((listeners) => listeners.size === 0)).toBe(true);
	expect(s.events.map((e) => e.kind)).toEqual(['subscribe', 'unsubscribe', 'run-ended']);
	expect(s.onNext).not.toHaveBeenCalled();
	expect(s.onComplete).not.toHaveBeenCalled();
	expect(vi.getTimerCount()).toBe(0);
});
it('forces stop after 100 ms without inventing a teardown', () => {
	const s = setup();
	s.worker.trace(s.event(1, { ...s.occurrence, kind: 'subscribe' }));
	s.subscription.unsubscribe();
	vi.advanceTimersByTime(99);
	expect(s.worker.terminate).not.toHaveBeenCalled();
	vi.advanceTimersByTime(1);
	expect(s.worker.terminate).toHaveBeenCalledOnce();
	expect(s.events.map((e) => e.kind)).toEqual(['subscribe', 'run-ended']);
	expect(s.events.at(-1)).toMatchObject({
		reason: 'cancelled',
		teardownConfirmed: false,
		seq: 2,
	});
	expect(s.onError).not.toHaveBeenCalled();
	expect(vi.getTimerCount()).toBe(0);
});
it.each([
	'version',
	'sequence',
	'clock',
	'shape',
	'unknown-parent',
	'notification-before-subscribe',
])('rejects malformed %s records with a distinct transport diagnostic', (corruption) => {
	const s = setup();
	const event = s.event(1, { ...s.occurrence, kind: 'subscribe' });
	if (corruption === 'version') event.version = 2;
	if (corruption === 'sequence') event.seq = 2;
	if (corruption === 'clock') event.timeMs = -1;
	if (corruption === 'shape') Object.assign(event, { path: [1] });
	if (corruption === 'unknown-parent') Object.assign(event, { parentSubscriptionId: 'missing' });
	if (corruption === 'notification-before-subscribe')
		Object.assign(event, { kind: 'next', value: 'x', valueId: 'x' });
	s.worker.trace(event);
	s.worker.listeners.get('error')?.forEach((fn) => fn({} as Event));
	expect(s.events.map((e) => e.kind)).toEqual(['diagnostic', 'run-ended']);
	expect(s.events.at(-1)).toMatchObject({ reason: 'error', teardownConfirmed: false });
	expect(s.onDiagnostic).toHaveBeenCalledExactlyOnceWith(
		expect.objectContaining({ category: 'transport' }),
	);
	expect(s.onCreationError).toHaveBeenCalledOnce();
	expect(s.onError).not.toHaveBeenCalled();
	expect(s.worker.terminate).toHaveBeenCalledOnce();
});
it('reports construction failure before any subscription', () => {
	const events: FlowTraceEvent[] = [];
	startObservableSimulation({ ...graph, elements: [], onTrace: (e) => events.push(e) });
	expect(events.map((e) => e.kind)).toEqual(['diagnostic', 'run-ended']);
	expect(events.at(-1)).toMatchObject({ reason: 'error', teardownConfirmed: true });
});
it('ignores obsolete runs and gives a restart fresh identities/sequence', () => {
	const first = setup();
	first.worker.trace(first.event(1, { ...first.occurrence, kind: 'subscribe' }));
	first.subscription.unsubscribe();
	vi.advanceTimersByTime(100);
	const second = setup();
	second.worker.send({
		version: 1,
		type: Type.Trace,
		runId: first.worker.runId,
		event: first.event(2, { ...first.occurrence, kind: 'next', valueId: 'old', value: 'old' }),
	});
	expect(second.events).toEqual([]);
	expect(second.worker.runId).not.toBe(first.worker.runId);
	second.worker.trace(second.event(1, { ...second.occurrence, kind: 'subscribe' }));
	expect(second.events[0]).toMatchObject({
		seq: 1,
		subscriptionId: second.occurrence.subscriptionId,
	});
	second.subscription.unsubscribe();
	vi.advanceTimersByTime(100);
});
it('Worker and literal fallback deliver equivalent normalized traces', async () => {
	const fallback: FlowTraceEvent[] = [];
	vi.stubGlobal('Worker', undefined);
	startObservableSimulation({ ...graph, onTrace: (e) => fallback.push(e) });
	vi.resetModules();
	let dispatch: ((event: { data: unknown }) => void) | undefined;
	const scope = {
		addEventListener: (_type: string, listener: typeof dispatch) => {
			dispatch = listener;
		},
		postMessage: (data: unknown) => TestWorker.current.send(structuredClone(data)),
	};
	vi.stubGlobal('self', scope);
	await import('../observableSimulationWorker');
	class BridgeWorker extends TestWorker {
		readonly postMessage = vi.fn((data: unknown) => {
			dispatch!({ data: structuredClone(data) });
		});
	}
	vi.stubGlobal('Worker', BridgeWorker);
	const workerEvents: FlowTraceEvent[] = [];
	const onComplete = vi.fn();
	startObservableSimulation({ ...graph, onTrace: (e) => workerEvents.push(e), onComplete });
	const normalize = (events: FlowTraceEvent[]) => {
		const ids = new Map<string, string>();
		const id = (value: string) => {
			if (!ids.has(value)) ids.set(value, `id${ids.size}`);
			return ids.get(value)!;
		};
		return events.map((e) => ({
			...e,
			runId: 'run',
			eventId: `event${e.seq}`,
			timeMs: 0,
			...('subscriptionId' in e
				? {
						subscriptionId: id(e.subscriptionId),
						parentSubscriptionId:
							e.parentSubscriptionId === null ? null : id(e.parentSubscriptionId),
					}
				: {}),
			...('valueId' in e ? { valueId: id(e.valueId) } : {}),
			dependencies: e.dependencies.map(id),
		}));
	};
	expect(workerEvents.length).toBeGreaterThan(0);
	expect(normalize(workerEvents)).toEqual(normalize(fallback));
	expect(onComplete).toHaveBeenCalledOnce();
	expect(vi.getTimerCount()).toBe(0);
});

it('rejects a terminal legacy message without a successful root lifecycle end', () => {
	const s = setup();
	s.worker.send({ version: 1, runId: s.worker.runId, type: Type.Complete });
	expect(s.onComplete).not.toHaveBeenCalled();
	expect(s.onCreationError).toHaveBeenCalledOnce();
	expect(s.events.map((e) => e.kind)).toEqual(['diagnostic', 'run-ended']);
});
it('rejects missing run identities rather than silently waiting for a watchdog', () => {
	const s = setup();
	s.worker.send({ version: 1, type: Type.Heartbeat });
	expect(s.onDiagnostic).toHaveBeenCalledExactlyOnceWith(
		expect.objectContaining({ category: 'transport' }),
	);
	expect(s.worker.terminate).toHaveBeenCalledOnce();
	expect(vi.getTimerCount()).toBe(0);
});

it('preserves recoverable errors on the legacy onNext channel through real Worker recovery', async () => {
	vi.resetModules();
	let dispatch: ((event: { data: unknown }) => void) | undefined;
	vi.stubGlobal('self', {
		addEventListener: (_type: string, listener: typeof dispatch) => {
			dispatch = listener;
		},
		postMessage: (data: unknown) => TestWorker.current.send(structuredClone(data)),
	});
	await import('../observableSimulationWorker');
	class BridgeWorker extends TestWorker {
		readonly postMessage = vi.fn((data: unknown) => dispatch!({ data: structuredClone(data) }));
	}
	vi.stubGlobal('Worker', BridgeWorker);
	const failing = {
		...source,
		type: ElementType.ThrowError,
		properties: { errorOrErrorFactory: '() => new Error("fixture failure")' },
	};
	const recover = {
		...source,
		id: 'catch',
		type: ElementType.CatchError,
		properties: {
			selectorExpression:
				'err => { if(err.message !== "fixture failure") throw new Error("raw error"); return createObservable({start:7,count:2}); }',
		},
	};
	const inner = { ...source, id: 'inner', properties: { start: 99, count: 99 } };
	const innerSink = { ...sink, id: 'inner-sink' };
	const connect = (id: string, from: string, to: string, reference = false): ConnectLine => ({
		...line,
		id,
		source: {
			...line.source,
			id: from,
			connectPointType: reference ? ConnectPointType.Event : ConnectPointType.Output,
			connectPosition: reference ? ConnectPointPosition.Top : ConnectPointPosition.Right,
		},
		target: { ...line.target, id: to },
	});
	const onNext = vi.fn(),
		onError = vi.fn(),
		onCreationError = vi.fn(),
		onComplete = vi.fn();
	const events: FlowTraceEvent[] = [];
	startObservableSimulation({
		entryElementId: 'source',
		elements: [failing, recover, inner, innerSink, sink],
		connectLines: [
			connect('source-catch', 'source', 'catch'),
			connect('catch-sink', 'catch', 'sink'),
			connect('reference', 'catch', 'inner', true),
			connect('inner-output', 'inner', 'inner-sink'),
		],
		trusted: true,
		onNext,
		onError,
		onCreationError,
		onComplete,
		onTrace: (e) => events.push(e),
	});
	expect(onError).not.toHaveBeenCalled();
	expect(onCreationError).not.toHaveBeenCalled();
	expect(onComplete).toHaveBeenCalledOnce();
	expect(
		onNext.mock.calls.map(([value]) => value).filter((value) => value.type === 'error'),
	).toHaveLength(1);
	expect(
		onNext.mock.calls
			.map(([value]) => value)
			.filter((value) => value.type === 'next' && value.targetElementId === 'sink')
			.map((value) => value.value),
	).toEqual(['7', '8']);
	expect(events.at(-1)).toMatchObject({
		kind: 'run-ended',
		reason: 'completed',
		teardownConfirmed: true,
	});
	expect(vi.getTimerCount()).toBe(0);
});
