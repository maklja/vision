import { FlowTraceEvent, isFlowTraceEvent, isExecutionDiagnostic } from './trace/FlowTrace';
import { Unsubscribable } from 'rxjs';
import {
	ConnectLine,
	Element,
	ElementType,
	isParameterValue,
} from '@maklja/vision-simulator-model';
import { createSimulationModel, ObservableSimulation } from './ObservableSimulation';
import { FlowValueEvent } from './context';
import { MissingNextElementError, MissingReferenceObservableError } from './errors';
import {
	cloneContextSeed,
	ExecutionDiagnostic,
	ExecutionError,
	preflight,
	requiresTrustedWorker,
} from './execution/ExecutionRun';

export enum ObservableSimulationMessageType {
	StartSimulation = 'startSimulation',
	StopSimulation = 'stopSimulation',
	Next = 'next',
	Error = 'error',
	Complete = 'complete',
	CreationError = 'creationError',
	Heartbeat = 'heartbeat',
	Diagnostic = 'diagnostic',
	Trace = 'trace',
	Stopped = 'stopped',
}
export interface CreationErrorEvent {
	elementId: string;
	errorMessage: string;
	errorId: string;
}
export interface CreateObservableSimulationProps {
	entryElementId: string;
	elements: Element[];
	connectLines: ConnectLine[];
	contextSeed?: Record<string, unknown>;
	/** Granted by the caller's explicit, session-only revision approval. */
	trusted?: boolean;
	watchdogSeconds?: number;
	onTrace?: (event: FlowTraceEvent) => void;
	onDiagnostic?: (diagnostic: ExecutionDiagnostic) => void;
	onCreationError?: (event: CreationErrorEvent) => void;
	onNext?: (value: FlowValueEvent) => void;
	onError?: (value: FlowValueEvent) => void;
	onComplete?: () => void;
}
export function startObservableSimulation(
	options: CreateObservableSimulationProps,
): Unsubscribable {
	const { entryElementId, elements, connectLines, onNext, onError, onComplete, onCreationError } =
		options;
	const runId = crypto.randomUUID();
	let active = true;
	let stopping = false;
	let ended = false;
	let endReason: 'completed' | 'error' | 'cancelled' | undefined;
	let endTeardownConfirmed = false;
	let worker: Worker | undefined;
	let timer: ReturnType<typeof setInterval> | undefined;
	let stopTimer: ReturnType<typeof setTimeout> | undefined;
	let retained = 0;
	let lastSeq = 0;
	let lastTime = 0;
	let lastOccurrence = 0;
	// Retain only the root outcome after active occurrences are released.
	let root: { id: string; phase: 'open' | 'complete' | 'error'; tornDown: boolean } | undefined;
	const origin = performance.now();
	const occurrences = new Map<
		string,
		{ phase: 'open' | 'complete' | 'error'; parent: string | null; referenceLineId?: string }
	>();
	const cleanups: (() => void)[] = [];
	const cleanup = () => {
		active = false;
		clearInterval(timer);
		clearTimeout(stopTimer);
		cleanups.splice(0).forEach((cleanup) => cleanup());
		worker?.terminate();
		worker = undefined;
		occurrences.clear();
	};
	const hostTrace = (
		payload:
			| { kind: 'diagnostic'; diagnostic: ExecutionDiagnostic }
			| { kind: 'run-ended'; reason: 'error' | 'cancelled'; teardownConfirmed: boolean },
	) => {
		if (ended) return;
		lastTime = Math.max(lastTime, performance.now() - origin);
		options.onTrace?.({
			version: 1,
			runId,
			seq: ++lastSeq,
			timeMs: lastTime,
			eventId: `${runId}:event:${lastSeq}`,
			path: [],
			dependencies: [],
			...payload,
		});
		if (payload.kind === 'run-ended') ended = true;
	};
	const stop = () => {
		if (!active || stopping) return;
		active = false;
		clearInterval(timer);
		if (!worker || ended) {
			cleanup();
			return;
		}
		stopping = true;
		stopTimer = setTimeout(() => {
			hostTrace({ kind: 'run-ended', reason: 'cancelled', teardownConfirmed: false });
			cleanup();
		}, 100);
		try {
			worker.postMessage({
				type: ObservableSimulationMessageType.StopSimulation,
				version: 1,
				runId,
			});
		} catch {
			hostTrace({ kind: 'run-ended', reason: 'cancelled', teardownConfirmed: false });
			cleanup();
		}
	};
	const report = (diagnostic: ExecutionDiagnostic) => {
		if (retained < 99) {
			retained++;
			options.onDiagnostic?.({
				...diagnostic,
				runId,
				message: diagnostic.message.slice(0, 2048),
			});
		} else if (retained === 99) {
			// Deliver the summary once; repeated recoverable errors must not keep
			// triggering UI updates after the per-run retention limit is reached.
			retained++;
			options.onDiagnostic?.({
				category: 'policy',
				phase: 'host',
				runId,
				omittedCount: 1,
				message:
					'Diagnostic limit reached; additional diagnostics are suppressed (100 record limit).',
			});
		}
	};
	const failure = (
		category: ExecutionDiagnostic['category'],
		message: string,
		error?: unknown,
	) => {
		const diagnostic: ExecutionDiagnostic =
			error instanceof ExecutionError
				? { ...error.diagnostic, runId }
				: { category, phase: 'host', runId, elementId: entryElementId, message };
		if (!active) return;
		report(diagnostic);
		hostTrace({ kind: 'diagnostic', diagnostic });
		hostTrace({ kind: 'run-ended', reason: 'error', teardownConfirmed: !worker });
		cleanup();
		onCreationError?.({
			elementId: diagnostic.elementId ?? entryElementId,
			errorId: runId,
			errorMessage: diagnostic.message,
		});
	};
	try {
		const contextSeed = cloneContextSeed(options.contextSeed ?? {});
		const timeout = options.watchdogSeconds ?? 5;
		if (!Number.isFinite(timeout) || timeout < 1 || timeout > 60)
			throw new Error('Watchdog must be 1–60 seconds');
		// Graph construction inspects connections only; no authored callbacks are evaluated.
		const model = createSimulationModel(entryElementId, elements, connectLines);
		const reachableElements = model.getReachableElements();
		preflight(reachableElements);
		const unsafe = requiresTrustedWorker(reachableElements, contextSeed);
		if (unsafe && !options.trusted) {
			failure(
				'policy',
				'Review and explicitly trust this content revision before execution.',
			);
			return { unsubscribe: stop };
		}
		if (typeof Worker !== 'undefined') {
			try {
				worker = new Worker(new URL('./observableSimulationWorker.ts', import.meta.url), {
					name: 'ObservableWorker',
					type: 'module',
				});
			} catch {
				// CSP and deployment restrictions can make an exposed Worker API unusable.
				// Apply the same fallback admission checks as when the API is absent.
				report({
					category: 'transport',
					phase: 'host',
					runId,
					message:
						'Worker construction failed; treating Worker execution as unavailable.',
				});
			}
		}
		if (!worker) {
			if (unsafe) {
				failure('policy', 'A Worker is required for code, context and network execution.');
				return { unsubscribe: stop };
			}
			// Referenced branches can subscribe repeatedly (even to the same Range), so a
			// per-element count limit does not bound their aggregate synchronous work.
			if (model.graphBranches.size > 1) {
				failure(
					'policy',
					'Graphs with referenced sources require a Worker; literal fallback supports a single source graph only.',
				);
				return { unsubscribe: stop };
			}
			if (
				model.getGraphBranch(entryElementId).nodes.some(({ id }) => {
					// Disconnected elements remain editable drafts and do not run in this graph.
					const el = model.getElement(id);
					const count = el.properties.count;
					const literalCount =
						isParameterValue(count) && count.kind === 'literal' ? count.value : count;
					return (
						el.type === ElementType.Range &&
						(literalCount === undefined || Number(literalCount) > 10000)
					);
				})
			) {
				failure(
					'policy',
					'Literal main-thread fallback requires an explicit Range count of at most 10000.',
				);
				return { unsubscribe: stop };
			}
			report({
				category: 'policy',
				phase: 'host',
				runId,
				message: 'Worker unavailable: limited literal-only execution on the main thread.',
			});
			const subscription = new ObservableSimulation(model, {}, report, runId, {
				onTrace: (event) => {
					lastSeq = event.seq;
					lastTime = event.timeMs;
					if (event.kind === 'run-ended') ended = true;
					options.onTrace?.(event);
				},
			}).start({
				next: (value) => {
					if (active) onNext?.(value);
				},
				error: (value) => {
					if (active) {
						cleanup();
						onError?.(value);
					}
				},
				complete: () => {
					if (active) {
						cleanup();
						onComplete?.();
					}
				},
			});
			return {
				unsubscribe() {
					active = false;
					subscription.unsubscribe();
					cleanup();
				},
			};
		}
		let heartbeat = Date.now();
		const listen = (type: string, handler: EventListener) => {
			worker!.addEventListener(type, handler);
			const target = worker!;
			cleanups.push(() => target.removeEventListener(type, handler));
		};
		const acceptTrace = (value: unknown) => {
			if (
				!isFlowTraceEvent(value) ||
				value.runId !== runId ||
				value.seq !== lastSeq + 1 ||
				value.timeMs < lastTime ||
				value.eventId !== `${runId}:event:${value.seq}` ||
				ended
			)
				return false;
			if ('subscriptionId' in value) {
				const state = occurrences.get(value.subscriptionId);
				if (value.kind === 'subscribe') {
					if (
						value.subscriptionId !== `${runId}:subscription:${lastOccurrence + 1}` ||
						state ||
						(value.parentSubscriptionId === null && root !== undefined) ||
						(value.parentSubscriptionId !== null &&
							occurrences.get(value.parentSubscriptionId)?.phase !== 'open')
					)
						return false;
					if (value.parentSubscriptionId === null)
						root = { id: value.subscriptionId, phase: 'open', tornDown: false };
					lastOccurrence++;
					occurrences.set(value.subscriptionId, {
						phase: 'open',
						parent: value.parentSubscriptionId,
						referenceLineId: value.referenceLineId,
					});
				} else {
					if (
						!state ||
						(value.kind !== 'unsubscribe' && state.phase !== 'open') ||
						value.parentSubscriptionId !== state.parent ||
						value.referenceLineId !== state.referenceLineId
					)
						return false;
					if (value.kind === 'complete' || value.kind === 'error') {
						state.phase = value.kind;
						if (root?.id === value.subscriptionId) root.phase = value.kind;
					}
					if (value.kind === 'unsubscribe') {
						if (
							(state.phase !== 'open' && value.reason !== state.phase) ||
							(state.phase === 'open' &&
								(value.reason === 'complete' || value.reason === 'error'))
						)
							return false;
						if (root?.id === value.subscriptionId) root.tornDown = true;
						occurrences.delete(value.subscriptionId);
					}
				}
			}
			if (value.kind === 'run-ended') {
				if (
					value.reason === 'completed' &&
					(!root ||
						root.phase !== 'complete' ||
						!root.tornDown ||
						!value.teardownConfirmed)
				)
					return false;
				if (value.teardownConfirmed && occurrences.size) return false;
				ended = true;
				endReason = value.reason;
				endTeardownConfirmed = value.teardownConfirmed;
			}
			lastSeq = value.seq;
			lastTime = value.timeMs;
			// Queued lifecycle records still describe real occurrences after stop.
			if (!stopping || value.kind !== 'next') options.onTrace?.(value);
			return true;
		};
		listen('message', ((ev: MessageEvent<unknown>) => {
			if (!active && !stopping) return;
			const data = ev.data;
			if (!data || typeof data !== 'object') {
				if (active) failure('transport', 'Malformed Worker message.');
				return;
			}
			const message = data as Record<string, unknown>;
			// An obsolete generation must not mutate callbacks or lifecycle state.
			if (typeof message.runId !== 'string') {
				if (active) failure('transport', 'Worker message has no run identity.');
				return;
			}
			if (message.runId !== runId) return;
			if (message.version !== 1) {
				if (active) failure('transport', 'Unsupported Worker protocol version.');
				return;
			}
			if (message.type === ObservableSimulationMessageType.Trace) {
				if (!acceptTrace(message.event) && active)
					failure('transport', 'Malformed or out-of-order lifecycle record.');
				return;
			}
			if (message.type === ObservableSimulationMessageType.Stopped && stopping) {
				if (!ended)
					hostTrace({ kind: 'run-ended', reason: 'cancelled', teardownConfirmed: false });
				cleanup();
				return;
			}
			if (!active) return;
			switch (message.type) {
				case ObservableSimulationMessageType.Heartbeat:
					heartbeat = Date.now();
					break;
				case ObservableSimulationMessageType.Next:
				case ObservableSimulationMessageType.Error:
					if (
						!isLegacyFlowValueEvent(message.value) ||
						(message.type === ObservableSimulationMessageType.Error &&
							(message.value.type !== 'error' ||
								!ended ||
								endReason !== 'error' ||
								root?.phase !== 'error' ||
								!root.tornDown ||
								!endTeardownConfirmed)) ||
						(message.type === ObservableSimulationMessageType.Next &&
							!['next', 'subscribe', 'error'].includes(message.value.type))
					) {
						failure('transport', 'Malformed Worker value.');
						return;
					}
					if (message.type === ObservableSimulationMessageType.Next)
						onNext?.(message.value);
					else {
						cleanup();
						onError?.(message.value);
					}
					break;
				case ObservableSimulationMessageType.Diagnostic:
					if (
						!isExecutionDiagnostic(message.diagnostic) ||
						message.diagnostic.runId !== runId
					) {
						failure('transport', 'Malformed Worker diagnostic.');
						return;
					}
					report(message.diagnostic);
					break;
				case ObservableSimulationMessageType.Complete:
					if (!ended || endReason !== 'completed') {
						failure('transport', 'Completion without a successful root run end.');
						return;
					}
					cleanup();
					onComplete?.();
					break;
				case ObservableSimulationMessageType.CreationError:
					if (
						!isExecutionDiagnostic(message.diagnostic) ||
						message.diagnostic.runId !== runId
					) {
						failure('transport', 'Malformed Worker diagnostic.');
						return;
					}
					failure(
						message.diagnostic.category,
						message.diagnostic.message,
						new ExecutionError(message.diagnostic),
					);
					break;
				default:
					failure('transport', 'Unknown Worker message.');
			}
		}) as EventListener);
		listen('error', (() => {
			if (active) failure('transport', 'Execution Worker failed to start or crashed.');
		}) as EventListener);
		listen('messageerror', (() => {
			if (active) failure('transport', 'Execution Worker message could not be decoded.');
		}) as EventListener);

		timer = setInterval(() => {
			if (Date.now() - heartbeat >= timeout * 1000)
				failure(
					'watchdog',
					`Worker did not respond for ${timeout} seconds. Background throttling can cause this. Forced termination cannot guarantee cleanup or undo network requests.`,
				);
		}, 250);
		worker.postMessage({
			type: ObservableSimulationMessageType.StartSimulation,
			version: 1,
			runId,
			entryElementId,
			elements,
			connectLines,
			contextSeed,
		});
	} catch (error) {
		if (
			error instanceof MissingNextElementError ||
			error instanceof MissingReferenceObservableError
		) {
			failure(
				'reference',
				error.message,
				new ExecutionError({
					category: 'reference',
					phase: 'preflight',
					runId,
					elementId: error.elementId,
					message: error.message.slice(0, 2048),
				}),
			);
			return { unsubscribe: stop };
		}
		failure(
			error instanceof ExecutionError ? error.diagnostic.category : 'schema',
			'Invalid graph, execution settings or transport data.',
			error,
		);
	}
	return { unsubscribe: stop };
}

function isLegacyFlowValueEvent(value: unknown): value is FlowValueEvent {
	if (!value || typeof value !== 'object') return false;
	const v = value as Record<string, unknown>;
	return (
		['id', 'value', 'hash', 'sourceElementId', 'targetElementId'].every(
			(k) => typeof v[k] === 'string',
		) &&
		(v.subscribeId === null || typeof v.subscribeId === 'string') &&
		Number.isSafeInteger(v.index) &&
		['next', 'error', 'subscribe'].includes(v.type as string) &&
		['connectLinesId', 'dependencies'].every(
			(k) => Array.isArray(v[k]) && (v[k] as unknown[]).every((id) => typeof id === 'string'),
		)
	);
}
