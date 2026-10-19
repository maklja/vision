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

it.each([
	'missing root',
	'cancelled root',
	'failed root',
	'completed child only',
	'unconfirmed teardown',
])('rejects successful run end with %s and never invokes onComplete', (scenario) => {
	const s = setup();
	const records: object[] = [];
	if (scenario !== 'missing root') {
		records.push({ ...s.occurrence, kind: 'subscribe' });
		if (scenario === 'completed child only') {
			const child = {
				...s.occurrence,
				subscriptionId: `${s.worker.runId}:subscription:2`,
				parentSubscriptionId: s.occurrence.subscriptionId,
				referenceLineId: 'reference',
			};
			records.push(
				{ ...child, kind: 'subscribe' },
				{ ...child, kind: 'complete' },
				{ ...child, kind: 'unsubscribe', reason: 'complete' },
			);
		}
		if (scenario === 'failed root')
			records.push({ ...s.occurrence, kind: 'error', valueId: 'error', value: 'failure' });
		if (scenario === 'unconfirmed teardown')
			records.push({ ...s.occurrence, kind: 'complete' });
		records.push({
			...s.occurrence,
			kind: 'unsubscribe',
			reason:
				scenario === 'failed root'
					? 'error'
					: scenario === 'unconfirmed teardown'
						? 'complete'
						: 'consumer-unsubscribe',
		});
	}
	records.forEach((record, index) => s.worker.trace(s.event(index + 1, record)));
	s.worker.trace(
		s.event(records.length + 1, {
			kind: 'run-ended',
			reason: 'completed',
			teardownConfirmed: scenario !== 'unconfirmed teardown',
		}),
	);
	s.worker.send({ version: 1, runId: s.worker.runId, type: Type.Complete });
	expect(s.onComplete).not.toHaveBeenCalled();
	expect(s.onError).not.toHaveBeenCalled();
	expect(s.onDiagnostic).toHaveBeenCalledExactlyOnceWith(
		expect.objectContaining({ category: 'transport' }),
	);
	expect(s.onCreationError).toHaveBeenCalledOnce();
	expect(s.events.at(-1)).toMatchObject({
		kind: 'run-ended',
		reason: 'error',
		teardownConfirmed: false,
	});
	expect(
		s.events.some((event) => event.kind === 'run-ended' && event.reason === 'completed'),
	).toBe(false);
	expect(s.worker.terminate).toHaveBeenCalledOnce();
	expect(vi.getTimerCount()).toBe(0);
});
it('accepts success only after the root completed and its teardown was observed', () => {
	const s = setup();
	[
		{ ...s.occurrence, kind: 'subscribe' },
		{ ...s.occurrence, kind: 'complete' },
		{ ...s.occurrence, kind: 'unsubscribe', reason: 'complete' },
		{ kind: 'run-ended', reason: 'completed', teardownConfirmed: true },
	].forEach((record, index) => s.worker.trace(s.event(index + 1, record)));
	s.worker.send({ version: 1, runId: s.worker.runId, type: Type.Complete });
	expect(s.onComplete).toHaveBeenCalledOnce();
	expect(s.onCreationError).not.toHaveBeenCalled();
	expect(s.onDiagnostic).not.toHaveBeenCalled();
	expect(s.worker.terminate).toHaveBeenCalledOnce();
	expect(vi.getTimerCount()).toBe(0);
});
it('rejects a second root instead of replacing the cancelled root outcome', () => {
	const s = setup();
	s.worker.trace(s.event(1, { ...s.occurrence, kind: 'subscribe' }));
	s.worker.trace(
		s.event(2, { ...s.occurrence, kind: 'unsubscribe', reason: 'consumer-unsubscribe' }),
	);
	s.worker.trace(
		s.event(3, {
			...s.occurrence,
			subscriptionId: `${s.worker.runId}:subscription:2`,
			kind: 'subscribe',
		}),
	);
	expect(s.onDiagnostic).toHaveBeenCalledExactlyOnceWith(
		expect.objectContaining({ category: 'transport' }),
	);
	expect(s.onComplete).not.toHaveBeenCalled();
	expect(s.events.filter((event) => event.kind === 'subscribe')).toHaveLength(1);
	expect(s.worker.terminate).toHaveBeenCalledOnce();
});

const legacyError = {
	id: 'failure',
	subscribeId: null,
	dependencies: [],
	index: 1,
	value: 'Observable execution failed.',
	hash: 'hash',
	type: 'error',
	connectLinesId: ['line'],
	sourceElementId: 'source',
	targetElementId: 'sink',
};
it.each(['complete', 'error', 'cancelled'] as const)(
	'preserves queued subscribe and %s lifecycle records when stop happens before delivery',
	(outcome) => {
		const s = setup();
		s.subscription.unsubscribe();
		const records: object[] = [
			{ ...s.occurrence, kind: 'subscribe' },
			{ ...s.occurrence, kind: 'next', valueId: 'queued-value', value: 'queued' },
		];
		if (outcome !== 'cancelled')
			records.push({
				...s.occurrence,
				kind: outcome,
				...(outcome === 'error' ? { valueId: 'failure', value: 'failure' } : {}),
			});
		records.push(
			{
				...s.occurrence,
				kind: 'unsubscribe',
				reason: outcome === 'cancelled' ? 'run-stop' : outcome,
			},
			{
				kind: 'run-ended',
				reason: outcome === 'complete' ? 'completed' : outcome,
				teardownConfirmed: true,
			},
		);
		records.forEach((record, index) => s.worker.trace(s.event(index + 1, record)));
		s.worker.send({
			version: 1,
			runId: s.worker.runId,
			type: Type.Next,
			value: { ...legacyError, type: 'next' },
		});
		s.worker.send({
			version: 1,
			runId: s.worker.runId,
			type: outcome === 'error' ? Type.Error : Type.Complete,
			value: legacyError,
		});
		s.worker.send({ version: 1, runId: s.worker.runId, type: Type.Stopped });
		expect(s.events.map((event) => event.kind)).toEqual(
			outcome === 'cancelled'
				? ['subscribe', 'unsubscribe', 'run-ended']
				: ['subscribe', outcome, 'unsubscribe', 'run-ended'],
		);
		expect(s.events[0]).toMatchObject({ ...s.occurrence, kind: 'subscribe', seq: 1 });
		expect(s.events.find((event) => event.kind === 'unsubscribe')).toMatchObject({
			subscriptionId: s.occurrence.subscriptionId,
		});
		expect(s.onNext).not.toHaveBeenCalled();
		expect(s.onError).not.toHaveBeenCalled();
		expect(s.onComplete).not.toHaveBeenCalled();
		expect(s.onDiagnostic).not.toHaveBeenCalled();
		expect(s.worker.terminate).toHaveBeenCalledOnce();
		expect(vi.getTimerCount()).toBe(0);
	},
);
it.each([
	'missing root',
	'cancelled root',
	'completed root',
	'child error only',
	'missing teardown',
	'unconfirmed teardown',
])('rejects a legacy observable error with %s', (scenario) => {
	const s = setup();
	const records: object[] = [];
	if (scenario !== 'missing root') {
		records.push({ ...s.occurrence, kind: 'subscribe' });
		if (scenario === 'child error only') {
			const child = {
				...s.occurrence,
				subscriptionId: `${s.worker.runId}:subscription:2`,
				parentSubscriptionId: s.occurrence.subscriptionId,
				referenceLineId: 'reference',
			};
			records.push(
				{ ...child, kind: 'subscribe' },
				{ ...child, kind: 'error', valueId: 'child-error', value: 'failure' },
				{ ...child, kind: 'unsubscribe', reason: 'error' },
			);
		}
		if (scenario === 'completed root') records.push({ ...s.occurrence, kind: 'complete' });
		if (scenario === 'missing teardown' || scenario === 'unconfirmed teardown')
			records.push({
				...s.occurrence,
				kind: 'error',
				valueId: 'root-error',
				value: 'failure',
			});
		if (scenario !== 'missing teardown')
			records.push({
				...s.occurrence,
				kind: 'unsubscribe',
				reason:
					scenario === 'completed root'
						? 'complete'
						: scenario === 'unconfirmed teardown'
							? 'error'
							: 'consumer-unsubscribe',
			});
	}
	records.push({
		kind: 'run-ended',
		reason: 'error',
		teardownConfirmed: scenario !== 'missing teardown' && scenario !== 'unconfirmed teardown',
	});
	records.forEach((record, index) => s.worker.trace(s.event(index + 1, record)));
	// A rootless/forced error end is valid control information, not proof of an observable error.
	expect(s.onDiagnostic).not.toHaveBeenCalled();
	s.worker.send({ version: 1, runId: s.worker.runId, type: Type.Error, value: legacyError });
	expect(s.onError).not.toHaveBeenCalled();
	expect(s.onComplete).not.toHaveBeenCalled();
	expect(s.onDiagnostic).toHaveBeenCalledExactlyOnceWith(
		expect.objectContaining({ category: 'transport' }),
	);
	expect(s.onCreationError).toHaveBeenCalledOnce();
	expect(s.worker.terminate).toHaveBeenCalledOnce();
	expect(vi.getTimerCount()).toBe(0);
});
it('preserves construction failure reporting after a rootless error run end', () => {
	const s = setup();
	const diagnostic = {
		runId: s.worker.runId,
		category: 'reference',
		phase: 'preflight',
		elementId: 'source',
		message: 'Graph construction failed.',
	};
	s.worker.trace(s.event(1, { kind: 'diagnostic', diagnostic }));
	s.worker.trace(s.event(2, { kind: 'run-ended', reason: 'error', teardownConfirmed: true }));
	s.worker.send({ version: 1, runId: s.worker.runId, type: Type.CreationError, diagnostic });
	expect(s.onError).not.toHaveBeenCalled();
	expect(s.onComplete).not.toHaveBeenCalled();
	expect(s.onDiagnostic).toHaveBeenCalledExactlyOnceWith(diagnostic);
	expect(s.onCreationError).toHaveBeenCalledExactlyOnceWith({
		elementId: 'source',
		errorId: s.worker.runId,
		errorMessage: diagnostic.message,
	});
	expect(s.worker.terminate).toHaveBeenCalledOnce();
	expect(vi.getTimerCount()).toBe(0);
});
