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
	let worker: Worker | undefined;
	let timer: ReturnType<typeof setInterval> | undefined;
	let retained = 0;
	const stop = () => {
		active = false;
		clearInterval(timer);
		worker?.terminate();
		worker = undefined;
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
		report(diagnostic);
		stop();
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
			const subscription = new ObservableSimulation(model, {}, report, runId).start({
				next: onNext,
				error: onError,
				complete: onComplete,
			});
			return {
				unsubscribe() {
					stop();
					subscription.unsubscribe();
				},
			};
		}
		let heartbeat = Date.now();
		worker.addEventListener(
			'message',
			(
				ev: MessageEvent<{
					runId: string;
					type: ObservableSimulationMessageType;
					value: FlowValueEvent;
					diagnostic: ExecutionDiagnostic;
				}>,
			) => {
				if (!active || ev.data.runId !== runId) return;
				const data = ev.data;
				switch (data.type) {
					case ObservableSimulationMessageType.Heartbeat:
						heartbeat = Date.now();
						break;
					case ObservableSimulationMessageType.Next:
						onNext?.(data.value);
						break;
					case ObservableSimulationMessageType.Error:
						stop();
						onError?.(data.value);
						break;
					case ObservableSimulationMessageType.Diagnostic:
						report(data.diagnostic);
						break;
					case ObservableSimulationMessageType.Complete:
						stop();
						onComplete?.();
						break;
					case ObservableSimulationMessageType.CreationError:
						failure(
							data.diagnostic.category,
							data.diagnostic.message,
							new ExecutionError(data.diagnostic),
						);
						break;
				}
			},
		);
		worker.addEventListener('error', () => {
			if (active) failure('transport', 'Execution Worker failed to start or crashed.');
		});
		worker.addEventListener('messageerror', () => {
			if (active) failure('transport', 'Execution Worker message could not be decoded.');
		});
		timer = setInterval(() => {
			if (Date.now() - heartbeat >= timeout * 1000)
				failure(
					'watchdog',
					`Worker did not respond for ${timeout} seconds. Background throttling can cause this. Forced termination cannot guarantee cleanup or undo network requests.`,
				);
		}, 250);
		worker.postMessage({
			type: ObservableSimulationMessageType.StartSimulation,
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
