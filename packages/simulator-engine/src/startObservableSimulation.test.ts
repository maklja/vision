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
import { ObservableSimulation } from './ObservableSimulation';
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

	removeEventListener(type: string, listener: Listener): void {
		this.listeners.set(
			type,
			(this.listeners.get(type) ?? []).filter((value) => value !== listener),
		);
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
		if (type === ObservableSimulationMessageType.Complete)
			worker.dispatch('message', {
				data: {
					version: 1,
					runId: start.runId,
					type: ObservableSimulationMessageType.Trace,
					event: {
						version: 1,
						runId: start.runId,
						seq: 1,
						timeMs: 0,
						eventId: `${start.runId}:event:1`,
						path: [],
						dependencies: [],
						kind: 'run-ended',
						reason: 'completed',
						teardownConfirmed: true,
					},
				},
			});
		worker.dispatch('message', {
			data: { version: 1, type, runId: runId ?? start.runId, value },
		});
	}
	it('ignores transient result nodes when preflighting a restarted run', () => {
		const onCreationError = vi.fn();
		const subscription = launch({
			elements: [...elements, element('previous-result', ElementType.Result)],
			onCreationError,
		});
		expect(onCreationError).not.toHaveBeenCalled();
		expect(FakeWorker.instances).toHaveLength(1);
		subscription.unsubscribe();
	});
	it('requires explicit trust and never starts a Worker before approval', () => {
		const onCreationError = vi.fn();
		launch({ trusted: false, onCreationError });
		expect(FakeWorker.instances).toHaveLength(0);
		expect(onCreationError).toHaveBeenCalledOnce();
	});
	it.each([false, true])(
		'classifies an omitted From mode using its default (trusted: %s)',
		(trusted) => {
			const reference = link('source-range', source.id, 'range');
			reference.source.connectPointType = ConnectPointType.Event;
			reference.source.connectPosition = ConnectPointPosition.Top;
			const onDiagnostic = vi.fn();
			const subscription = launch({
				elements: [
					element(source.id, ElementType.From),
					element('range', ElementType.Range, { start: 0, count: 1 }),
					subscriber,
				],
				connectLines: [
					...connectLines,
					reference,
					link('range-subscriber', 'range', subscriber.id),
				],
				trusted,
				onDiagnostic,
			});
			expect(FakeWorker.instances).toHaveLength(trusted ? 1 : 0);
			if (trusted) expect(onDiagnostic).not.toHaveBeenCalled();
			else
				expect(onDiagnostic).toHaveBeenCalledExactlyOnceWith(
					expect.objectContaining({
						category: 'policy',
						message: expect.stringContaining('explicitly trust'),
					}),
				);
			subscription.unsubscribe();
		},
	);

	it.each([true, false])(
		'ignores malformed disconnected code (Worker: %s)',
		(workerAvailable) => {
			vi.stubGlobal('Worker', workerAvailable ? FakeWorker : undefined);
			const onCreationError = vi.fn(),
				onNext = vi.fn();
			const subscription = startObservableSimulation({
				entryElementId: source.id,
				elements: [
					element(source.id, ElementType.Range, { start: 0, count: 2 }),
					element('draft', ElementType.Of, { argsFactoryExpression: '() =>' }),
					subscriber,
				],
				connectLines,
				trusted: false,
				onCreationError,
				onNext,
			});
			expect(onCreationError).not.toHaveBeenCalled();
			expect(FakeWorker.instances).toHaveLength(workerAvailable ? 1 : 0);
			expect(onNext).toHaveBeenCalledTimes(workerAvailable ? 0 : 2);
			subscription.unsubscribe();
		},
	);

	it('still preflights malformed code in referenced branches', () => {
		const reference = link('source-child', source.id, 'child');
		reference.source.connectPointType = ConnectPointType.Event;
		reference.source.connectPosition = ConnectPointPosition.Top;
		const onDiagnostic = vi.fn();
		launch({
			elements: [
				element(source.id, ElementType.Merge, { limitConcurrent: 0 }),
				element('child', ElementType.Of, { argsFactoryExpression: '() =>' }),
				subscriber,
			],
			connectLines: [
				...connectLines,
				reference,
				link('child-subscriber', 'child', subscriber.id),
			],
			onDiagnostic,
		});
		expect(FakeWorker.instances).toHaveLength(0);
		expect(onDiagnostic).toHaveBeenCalledExactlyOnceWith(
			expect.objectContaining({
				category: 'compile',
				elementId: 'child',
				field: 'argsFactoryExpression',
			}),
		);
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
	it.each([2, undefined, 10001])(
		'applies literal fallback limits when Worker construction throws (count: %s)',
		(count) => {
			const createWorker = vi.fn(function () {
				throw new DOMException('Blocked by worker-src', 'SecurityError');
			});
			vi.stubGlobal('Worker', createWorker);
			const onNext = vi.fn(),
				onComplete = vi.fn(),
				onCreationError = vi.fn(),
				onDiagnostic = vi.fn();
			const subscription = startObservableSimulation({
				entryElementId: source.id,
				elements: [
					element(source.id, ElementType.Range, {
						start: 0,
						...(count === undefined ? {} : { count }),
					}),
					subscriber,
				],
				connectLines,
				onNext,
				onComplete,
				onCreationError,
				onDiagnostic,
			});
			expect(createWorker).toHaveBeenCalledOnce();
			expect(onDiagnostic.mock.calls[0][0]).toMatchObject({ category: 'transport' });
			expect(onDiagnostic.mock.calls.some(([d]) => d.category === 'schema')).toBe(false);
			if (count === 2) {
				expect(onNext).toHaveBeenCalledTimes(2);
				expect(onComplete).toHaveBeenCalledOnce();
				expect(onCreationError).not.toHaveBeenCalled();
				expect(onDiagnostic).toHaveBeenLastCalledWith(
					expect.objectContaining({
						category: 'policy',
						message: expect.stringContaining('literal-only'),
					}),
				);
			} else {
				expect(onNext).not.toHaveBeenCalled();
				expect(onCreationError).toHaveBeenCalledOnce();
				expect(onDiagnostic).toHaveBeenLastCalledWith(
					expect.objectContaining({
						category: 'policy',
						message: expect.stringContaining('explicit Range count'),
					}),
				);
			}
			subscription.unsubscribe();
			expect(vi.getTimerCount()).toBe(0);
		},
	);

	it.each(['code', 'context', 'network'])(
		'never falls back to the main thread for %s when Worker construction throws',
		(kind) => {
			vi.stubGlobal(
				'Worker',
				vi.fn(function () {
					throw new DOMException('Blocked by worker-src', 'SecurityError');
				}),
			);
			const start = vi.spyOn(ObservableSimulation.prototype, 'start');
			const onDiagnostic = vi.fn(),
				onCreationError = vi.fn();
			startObservableSimulation({
				entryElementId: source.id,
				elements: [
					kind === 'code'
						? source
						: element(
								source.id,
								kind === 'network' ? ElementType.Ajax : ElementType.Range,
								kind === 'network' ? {} : { start: 0, count: 2 },
							),
					subscriber,
				],
				connectLines,
				trusted: true,
				contextSeed: kind === 'context' ? { seen: 0 } : {},
				onDiagnostic,
				onCreationError,
			});
			expect(start).not.toHaveBeenCalled();
			expect(onCreationError).toHaveBeenCalledOnce();
			expect(onDiagnostic.mock.calls[0][0]).toMatchObject({ category: 'transport' });
			expect(onDiagnostic).toHaveBeenLastCalledWith(
				expect.objectContaining({
					category: 'policy',
					message: expect.stringContaining('A Worker is required'),
				}),
			);
			expect(vi.getTimerCount()).toBe(0);
		},
	);
	it.each([true, false])(
		'attributes host graph errors to the disconnected downstream element (Worker: %s)',
		(workerAvailable) => {
			vi.stubGlobal('Worker', workerAvailable ? FakeWorker : undefined);
			const onDiagnostic = vi.fn(),
				onCreationError = vi.fn();
			startObservableSimulation({
				entryElementId: source.id,
				elements: [
					source,
					element('disconnected-map', ElementType.Map, {
						projectExpression: 'value => value',
					}),
				],
				connectLines: [link('source-map', source.id, 'disconnected-map')],
				trusted: true,
				onDiagnostic,
				onCreationError,
			});
			expect(onDiagnostic).toHaveBeenCalledExactlyOnceWith(
				expect.objectContaining({
					category: 'reference',
					phase: 'preflight',
					elementId: 'disconnected-map',
					runId: expect.any(String),
				}),
			);
			expect(onCreationError).toHaveBeenCalledExactlyOnceWith(
				expect.objectContaining({ elementId: 'disconnected-map' }),
			);
			expect(FakeWorker.instances).toHaveLength(0);
		},
	);

	it.each([false, true])(
		'blocks aggregate synchronous Range work before fallback starts (shared source: %s)',
		(shared) => {
			vi.stubGlobal('Worker', undefined);
			// If the admission guard regresses, fail without actually emitting a million UI events.
			const start = vi
				.spyOn(ObservableSimulation.prototype, 'start')
				.mockReturnValue({ unsubscribe() {} });
			const onDiagnostic = vi.fn(),
				onNext = vi.fn();
			const ranges = Array.from({ length: shared ? 1 : 100 }, (_, index) =>
				element(`range-${index}`, ElementType.Range, { start: 0, count: 10000 }),
			);
			const references = Array.from({ length: 100 }, (_, index) => {
				const line = link(
					`reference-${index}`,
					source.id,
					ranges[shared ? 0 : index].id,
					index,
				);
				return {
					...line,
					source: {
						...line.source,
						connectPointType: ConnectPointType.Event,
						connectPosition: ConnectPointPosition.Top,
					},
				};
			});
			startObservableSimulation({
				entryElementId: source.id,
				elements: [
					element(source.id, ElementType.Merge, { limitConcurrent: 0 }),
					...ranges,
					subscriber,
				],
				connectLines: [
					...connectLines,
					...references,
					...ranges.map((range) =>
						link(`${range.id}-subscriber`, range.id, subscriber.id),
					),
				],
				onDiagnostic,
				onNext,
			});
			expect(start).not.toHaveBeenCalled();
			expect(onNext).not.toHaveBeenCalled();
			expect(onDiagnostic).toHaveBeenCalledExactlyOnceWith(
				expect.objectContaining({
					category: 'policy',
					message: expect.stringContaining('single source graph'),
				}),
			);
		},
	);

	it.each([undefined, 10001, 10000])(
		'ignores an unreachable Range count of %s during fallback admission',
		(count) => {
			vi.stubGlobal('Worker', undefined);
			const onNext = vi.fn(),
				onCreationError = vi.fn();
			startObservableSimulation({
				entryElementId: source.id,
				elements: [
					element(source.id, ElementType.Range, { start: 0, count: 2 }),
					element('unused', ElementType.Range, {
						start: 0,
						...(count === undefined ? {} : { count }),
					}),
					subscriber,
				],
				connectLines,
				onNext,
				onCreationError,
			});
			expect(onNext).toHaveBeenCalledTimes(2);
			expect(onCreationError).not.toHaveBeenCalled();
		},
	);

	it.each([undefined, 10001])(
		'still rejects a reachable Range count of %s in fallback',
		(count) => {
			vi.stubGlobal('Worker', undefined);
			const onNext = vi.fn(),
				onDiagnostic = vi.fn();
			startObservableSimulation({
				entryElementId: source.id,
				elements: [
					element(source.id, ElementType.Range, {
						start: 0,
						...(count === undefined ? {} : { count }),
					}),
					subscriber,
				],
				connectLines,
				onNext,
				onDiagnostic,
			});
			expect(onNext).not.toHaveBeenCalled();
			expect(onDiagnostic).toHaveBeenCalledExactlyOnceWith(
				expect.objectContaining({
					category: 'policy',
					message: expect.stringContaining('explicit Range count'),
				}),
			);
		},
	);

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
	it.each([false, true])(
		'requires trust for typed parameter expressions (Worker: %s)',
		(available) => {
			vi.stubGlobal('Worker', available ? FakeWorker : undefined);
			const onDiagnostic = vi.fn(),
				probe = vi.fn();
			vi.stubGlobal('parameterProbe', probe);
			const args = {
				entryElementId: source.id,
				elements: [
					element(source.id, ElementType.Range, {
						start: { kind: 'literal', type: 'number', value: 0 },
						count: {
							kind: 'expression',
							type: 'number',
							source: '(() => { parameterProbe(); return 1; })()',
						},
					}),
					subscriber,
				],
				connectLines,
				onDiagnostic,
			};
			startObservableSimulation({ ...args, trusted: available ? false : true });
			expect(probe).not.toHaveBeenCalled();
			expect(FakeWorker.instances).toHaveLength(0);
			expect(onDiagnostic.mock.calls[0][0]).toMatchObject({ category: 'policy' });
		},
	);
	it('applies fallback bounds to typed literal Range counts', () => {
		vi.stubGlobal('Worker', undefined);
		const onDiagnostic = vi.fn(),
			onNext = vi.fn();
		startObservableSimulation({
			entryElementId: source.id,
			elements: [
				element(source.id, ElementType.Range, {
					start: { kind: 'literal', type: 'number', value: 0 },
					count: { kind: 'literal', type: 'number', value: 10001 },
				}),
				subscriber,
			],
			connectLines,
			onDiagnostic,
			onNext,
		});
		expect(onNext).not.toHaveBeenCalled();
		expect(onDiagnostic.mock.calls[0][0]).toMatchObject({ category: 'policy' });
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
		expect(worker.terminate).not.toHaveBeenCalled();
		vi.advanceTimersByTime(100);
		expect(worker.terminate).toHaveBeenCalledOnce();
		expect(vi.getTimerCount()).toBe(0);
	});
	it('caps diagnostic deliveries at 99 details and one summary per run', () => {
		const onDiagnostic = vi.fn(),
			onNext = vi.fn(),
			onComplete = vi.fn();
		launch({ onDiagnostic, onNext, onComplete });
		const worker = FakeWorker.instances.at(-1)!;
		const { runId } = worker.postMessage.mock.calls[0][0] as { runId: string };
		const report = () =>
			worker.dispatch('message', {
				data: {
					version: 1,
					type: ObservableSimulationMessageType.Diagnostic,
					runId,
					diagnostic: {
						category: 'invocation',
						phase: 'callback',
						runId,
						elementId: 'map',
						field: 'projectExpression',
						message: 'Callback exception',
					},
				},
			});
		for (let i = 0; i < 99; i++) report();
		expect(onDiagnostic).toHaveBeenCalledTimes(99);
		expect(onDiagnostic.mock.calls.every(([d]) => d.category === 'invocation')).toBe(true);
		report();
		expect(onDiagnostic).toHaveBeenLastCalledWith(
			expect.objectContaining({
				category: 'policy',
				omittedCount: 1,
				message: expect.stringContaining('additional diagnostics are suppressed'),
			}),
		);
		for (let i = 0; i < 1000; i++) report();
		expect(onDiagnostic).toHaveBeenCalledTimes(100);
		send(ObservableSimulationMessageType.Next, nextEvent);
		send(ObservableSimulationMessageType.Complete);
		expect(onNext).toHaveBeenCalledExactlyOnceWith(nextEvent);
		expect(onComplete).toHaveBeenCalledOnce();
		expect(worker.terminate).toHaveBeenCalledOnce();

		// A new run receives its own diagnostic budget.
		launch({ onDiagnostic });
		onDiagnostic.mockClear();
		const nextWorker = FakeWorker.instances.at(-1)!;
		const nextRun = nextWorker.postMessage.mock.calls[0][0] as { runId: string };
		nextWorker.dispatch('message', {
			data: {
				version: 1,
				type: ObservableSimulationMessageType.Diagnostic,
				runId: nextRun.runId,
				diagnostic: {
					runId: nextRun.runId,
					category: 'invocation',
					phase: 'callback',
					message: 'New run',
				},
			},
		});
		expect(onDiagnostic).toHaveBeenCalledExactlyOnceWith(
			expect.objectContaining({
				category: 'invocation',
				runId: nextRun.runId,
				message: 'New run',
			}),
		);
		send(ObservableSimulationMessageType.Complete);
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
		data: {
			version: 1,
			runId: start.runId,
			type: ObservableSimulationMessageType.Trace,
			event: {
				version: 1,
				runId: start.runId,
				seq: 1,
				timeMs: 0,
				eventId: `${start.runId}:event:1`,
				path: [],
				dependencies: [],
				kind: 'run-ended',
				reason: 'error',
				teardownConfirmed: true,
			},
		},
	});
	worker.dispatch('message', {
		data: {
			version: 1,
			type: ObservableSimulationMessageType.Error,
			runId: start.runId,
			value: { ...nextEvent, type: FlowValueType.Error },
		},
	});
	expect(onError).toHaveBeenCalledWith({ ...nextEvent, type: FlowValueType.Error });
	expect(worker.terminate).toHaveBeenCalledOnce();
	vi.unstubAllGlobals();
});
