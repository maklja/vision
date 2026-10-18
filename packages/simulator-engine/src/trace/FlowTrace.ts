import { Observable, Subscriber } from 'rxjs';
import { FlowValue } from '../context/FlowManager';
import type { ExecutionDiagnostic } from '../execution/ExecutionRun';

export type TeardownReason =
	'complete' | 'error' | 'run-stop' | 'operator-cancel' | 'consumer-unsubscribe';
export interface TraceEnvelope {
	readonly version: 1;
	readonly runId: string;
	readonly seq: number;
	readonly timeMs: number;
	readonly eventId: string;
	readonly path: readonly string[];
	readonly dependencies: readonly string[];
}
export interface TraceOccurrence {
	readonly subscriptionId: string;
	readonly parentSubscriptionId: string | null;
	readonly elementId: string;
	readonly referenceLineId?: string;
}
export type FlowTraceEvent = TraceEnvelope &
	(
		| (TraceOccurrence & { kind: 'subscribe' })
		| (TraceOccurrence & { kind: 'complete' })
		| (TraceOccurrence & { kind: 'next'; valueId: string; value: string })
		| (TraceOccurrence & { kind: 'error'; valueId: string; value: string })
		| (TraceOccurrence & {
				kind: 'unsubscribe';
				reason: TeardownReason;
				cancellingElementId?: string;
		  })
		| {
				kind: 'run-ended';
				reason: 'completed' | 'error' | 'cancelled';
				teardownConfirmed: boolean;
		  }
		| { kind: 'diagnostic'; diagnostic: ExecutionDiagnostic }
	);
type TracePayload = FlowTraceEvent extends infer E
	? E extends TraceEnvelope
		? Omit<E, keyof TraceEnvelope> & Partial<Pick<TraceEnvelope, 'path' | 'dependencies'>>
		: never
	: never;
export interface TraceInvocation {
	readonly parentSubscriptionId: string;
	readonly referenceLineId: string;
	readonly cancellationElementId?: string;
}
interface ActiveOccurrence extends TraceOccurrence {
	terminal?: 'complete' | 'error';
	lastValueId?: string;
	lastTargetElementId?: string;
	errorPath?: readonly string[];
	errorValue?: FlowValue;
	cancellationElementId?: string;
}
export interface FlowTraceOptions {
	onTrace?: (event: FlowTraceEvent) => void;
	/** Monotonic milliseconds; production uses performance.now. */
	clock?: () => number;
}

/** Run-local lifecycle bookkeeping. No completed occurrence or value history is retained. */
export class FlowTrace {
	private seq = 0;
	private occurrence = 0;
	private elapsed = 0;
	private readonly origin: number;
	private readonly active = new Map<string, ActiveOccurrence>();
	private rootReason?: 'completed' | 'error' | 'cancelled';
	private ended = false;
	private stopping = false;
	private readonly clock: () => number;
	constructor(
		readonly runId: string,
		private readonly options: FlowTraceOptions = {},
		private readonly onEnded?: () => void,
	) {
		this.clock = options.clock ?? (() => performance.now());
		this.origin = this.clock();
	}
	emit(event: TracePayload) {
		if (this.ended) return;
		this.elapsed = Math.max(this.elapsed, this.clock() - this.origin, 0);
		this.options.onTrace?.({
			version: 1,
			runId: this.runId,
			seq: ++this.seq,
			timeMs: this.elapsed,
			eventId: `${this.runId}:event:${this.seq}`,
			path: [],
			dependencies: [],
			...event,
		} as FlowTraceEvent);
	}
	diagnostic(diagnostic: ExecutionDiagnostic) {
		this.emit({ kind: 'diagnostic', diagnostic });
	}
	observe(
		elementId: string,
		invocation: TraceInvocation | undefined,
		build: (id: string) => Observable<FlowValue>,
	) {
		return new Observable<FlowValue>((destination) => {
			if (
				this.ended ||
				this.stopping ||
				(invocation &&
					this.active.get(invocation.parentSubscriptionId)?.terminal !== undefined) ||
				(invocation && !this.active.has(invocation.parentSubscriptionId))
			) {
				destination.error(new Error('Invoking subscription has ended.'));
				return;
			}
			const subscriptionId = `${this.runId}:subscription:${++this.occurrence}`;
			const state: ActiveOccurrence = {
				subscriptionId,
				parentSubscriptionId: invocation?.parentSubscriptionId ?? null,
				elementId,
				...(invocation ? { referenceLineId: invocation.referenceLineId } : {}),
			};
			if (invocation?.cancellationElementId)
				state.cancellationElementId = invocation.cancellationElementId;
			this.active.set(subscriptionId, state);
			this.emit({ ...this.publicOccurrence(state), kind: 'subscribe' });
			const observer = new Subscriber<FlowValue>({
				next: (value) => {
					if (invocation)
						this.notification(subscriptionId, value, [invocation.referenceLineId]);
					destination.next(value);
				},
				error: (error: unknown) => {
					if (!state.terminal) {
						state.terminal = 'error';
						const value =
							error instanceof FlowValue
								? error
								: FlowValue.createErrorEvent(error, elementId);
						const failure = state.errorValue ?? value;
						this.notification(subscriptionId, failure, state.errorPath ?? [], true);
					}
					if (!invocation) this.rootReason = 'error';
					destination.error(error);
				},
				complete: () => {
					state.terminal = 'complete';
					this.emit({ ...this.publicOccurrence(state), kind: 'complete' });
					if (!invocation) this.rootReason = 'completed';
					destination.complete();
				},
			});
			// Attach before subscribe: synchronous terminal notifications must still tear down once.
			let subscribing = true;
			let teardownPending = false;
			let finalized = false;
			const finalize = () => {
				if (finalized) return;
				finalized = true;
				this.active.delete(subscriptionId);
				const reason: TeardownReason =
					state.terminal ??
					(this.stopping
						? 'run-stop'
						: state.cancellationElementId
							? 'operator-cancel'
							: 'consumer-unsubscribe');
				this.emit({
					...this.publicOccurrence(state),
					kind: 'unsubscribe',
					reason,
					...(reason === 'operator-cancel'
						? { cancellingElementId: state.cancellationElementId }
						: {}),
				});
				if (!invocation && !this.rootReason) this.rootReason = 'cancelled';
				this.finish();
			};
			destination.add(() => {
				observer.unsubscribe();
				if (subscribing) teardownPending = true;
				else finalize();
			});
			try {
				build(subscriptionId).subscribe(observer);
			} catch (error) {
				observer.error(error);
			} finally {
				subscribing = false;
				if (teardownPending) finalize();
			}
		});
	}
	private publicOccurrence(state: ActiveOccurrence): TraceOccurrence {
		return {
			subscriptionId: state.subscriptionId,
			parentSubscriptionId: state.parentSubscriptionId,
			elementId: state.elementId,
			...(state.referenceLineId ? { referenceLineId: state.referenceLineId } : {}),
		};
	}
	notification(
		subscriptionId: string,
		value: FlowValue,
		path: readonly string[],
		terminalError = false,
		elementId = value.elementId,
		targetElementId?: string,
	) {
		const state = this.active.get(subscriptionId);
		if (!state || (state.terminal && !terminalError)) return;
		if (!terminalError && value.type !== 'next') return;
		if (!terminalError) {
			state.lastValueId = value.id;
			state.lastTargetElementId = targetElementId;
			state.errorValue = undefined;
			state.errorPath = undefined;
		}
		this.emit({
			...this.publicOccurrence(state),
			elementId,
			kind: terminalError ? 'error' : 'next',
			valueId: value.id,
			value: terminalError ? 'Observable execution failed.' : `${value.raw}`,
			dependencies: [
				...new Set(
					terminalError &&
						state.lastValueId &&
						state.lastTargetElementId === value.elementId &&
						!value.dependencies.length
						? [state.lastValueId]
						: value.dependencies,
				),
			],
			path: [...path],
		});
	}
	noteError(subscriptionId: string, value: FlowValue, path: readonly string[]) {
		const state = this.active.get(subscriptionId);
		if (state) {
			state.errorValue = value;
			state.errorPath = path;
		}
	}
	stop() {
		this.stopping = true;
	}
	fail(diagnostic: ExecutionDiagnostic) {
		this.diagnostic(diagnostic);
		this.rootReason = 'error';
		this.finish();
	}
	private finish() {
		if (this.ended || !this.rootReason || this.active.size) return;
		this.emit({ kind: 'run-ended', reason: this.rootReason, teardownConfirmed: true });
		this.ended = true;
		this.onEnded?.();
	}
}

const record = (value: unknown): value is Record<string, unknown> =>
	!!value && typeof value === 'object' && !Array.isArray(value);
const strings = (value: unknown): value is string[] =>
	Array.isArray(value) && value.every((v) => typeof v === 'string');
/** Validate the wire boundary before using any message fields or dispatching callbacks. */
export function isFlowTraceEvent(value: unknown): value is FlowTraceEvent {
	if (
		!record(value) ||
		value.version !== 1 ||
		typeof value.runId !== 'string' ||
		!value.runId ||
		!Number.isSafeInteger(value.seq) ||
		(value.seq as number) < 1 ||
		typeof value.timeMs !== 'number' ||
		!Number.isFinite(value.timeMs) ||
		value.timeMs < 0 ||
		typeof value.eventId !== 'string' ||
		!value.eventId ||
		!strings(value.path) ||
		!strings(value.dependencies) ||
		new Set(value.dependencies).size !== value.dependencies.length
	)
		return false;
	if (value.kind !== 'next' && value.kind !== 'error' && ('valueId' in value || 'value' in value))
		return false;
	if (value.kind === 'diagnostic')
		return isExecutionDiagnostic(value.diagnostic) && value.diagnostic.runId === value.runId;
	if (value.kind === 'run-ended')
		return (
			['completed', 'error', 'cancelled'].includes(value.reason as string) &&
			typeof value.teardownConfirmed === 'boolean'
		);
	if (
		typeof value.subscriptionId !== 'string' ||
		!value.subscriptionId ||
		!(value.parentSubscriptionId === null || typeof value.parentSubscriptionId === 'string') ||
		typeof value.elementId !== 'string' ||
		(value.referenceLineId !== undefined && typeof value.referenceLineId !== 'string')
	)
		return false;
	if (value.kind === 'next' || value.kind === 'error')
		return (
			typeof value.valueId === 'string' && !!value.valueId && typeof value.value === 'string'
		);
	if (value.kind === 'unsubscribe')
		return (
			['complete', 'error', 'run-stop', 'operator-cancel', 'consumer-unsubscribe'].includes(
				value.reason as string,
			) &&
			(value.cancellingElementId === undefined ||
				typeof value.cancellingElementId === 'string')
		);
	return value.kind === 'subscribe' || value.kind === 'complete';
}
export function isExecutionDiagnostic(value: unknown): value is ExecutionDiagnostic {
	return (
		record(value) &&
		typeof value.runId === 'string' &&
		typeof value.message === 'string' &&
		value.message.length <= 2048 &&
		[
			'schema',
			'reference',
			'compile',
			'shape',
			'result',
			'invocation',
			'transport',
			'watchdog',
			'policy',
		].includes(value.category as string) &&
		['preflight', 'subscription', 'callback', 'host'].includes(value.phase as string) &&
		['elementId', 'field', 'subscriptionId'].every(
			(key) => value[key] === undefined || typeof value[key] === 'string',
		)
	);
}
