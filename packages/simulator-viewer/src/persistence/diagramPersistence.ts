import { get, set } from 'idb-keyval';
import { shallow } from 'zustand/shallow';
import { ConnectLine, Element, resultOperators } from '@maklja/vision-simulator-model';
import { RootStore, StateProps } from '../store/rootStore';
import type { CanvasState } from '../store/stage';

// TODO temp solution until multiple tabs are added
export const diagramId = 'test';

export interface PersistableDiagramState {
	elements: Record<string, Element>;
	connectLines: Record<string, ConnectLine>;
	canvasState: Pick<CanvasState, 'x' | 'y' | 'scaleX' | 'scaleY'> & Partial<CanvasState>;
	themeId: string;
}

export function createPersistedDiagram(state: PersistableDiagramState): StateProps {
	return {
		elements: Object.values(state.elements).filter((el) => !resultOperators.has(el.type)),
		connectLines: Object.values(state.connectLines),
		canvasState: {
			x: state.canvasState.x,
			y: state.canvasState.y,
			scaleX: state.canvasState.scaleX,
			scaleY: state.canvasState.scaleY,
		},
		themeId: state.themeId,
	};
}

export function loadDiagram(): Promise<StateProps | undefined> {
	return get<StateProps>(diagramId);
}

export function persistDiagram(diagram: StateProps): Promise<void> {
	return set(diagramId, diagram);
}

export function reportDiagramLoadError(error: unknown) {
	console.error(`Failed to load data from database. ${error}`);
}

export function reportDiagramSaveError(error: unknown) {
	console.error(`Failed to save data to database. ${error}`);
}

export interface DiagramRetryScheduler {
	schedule: (callback: () => void, delayMs: number) => () => void;
}

export interface DiagramPersistenceOptions {
	/** Total write attempts for a snapshot before it is dropped. */
	maxAttempts?: number;
	/** Base delay for the exponential retry backoff. */
	retryDelayMs?: number;
	scheduler?: DiagramRetryScheduler;
}

export const DEFAULT_MAX_PERSIST_ATTEMPTS = 3;
export const DEFAULT_RETRY_DELAY_MS = 1000;

export const defaultDiagramRetryScheduler: DiagramRetryScheduler = {
	schedule: (callback, delayMs) => {
		const timeoutId = setTimeout(callback, delayMs);
		return () => clearTimeout(timeoutId);
	},
};

export function subscribeDiagramPersistence(
	store: RootStore,
	onError: (error: unknown) => void = reportDiagramSaveError,
	options: DiagramPersistenceOptions = {},
): () => void {
	const {
		maxAttempts = DEFAULT_MAX_PERSIST_ATTEMPTS,
		retryDelayMs = DEFAULT_RETRY_DELAY_MS,
		scheduler = defaultDiagramRetryScheduler,
	} = options;

	let pendingSnapshot: StateProps | null = null;
	let cancelScheduledRetry: (() => void) | null = null;
	let attempts = 0;
	let writing = false;
	let disposed = false;

	function cancelRetry() {
		if (!cancelScheduledRetry) {
			return;
		}

		cancelScheduledRetry();
		cancelScheduledRetry = null;
	}

	function flush() {
		if (disposed || writing || pendingSnapshot === null) {
			return;
		}

		const snapshot = pendingSnapshot;
		pendingSnapshot = null;
		writing = true;

		persistDiagram(snapshot)
			.then(() => {
				writing = false;
				attempts = 0;
				flush();
			})
			.catch((error) => {
				writing = false;

				// The subscription was disposed while this write was in flight. Do not report or
				// re-queue: schedule nothing that would outlive teardown.
				if (disposed) {
					return;
				}

				onError(error);

				// A newer snapshot arrived while this write was failing. Retry the newest value with
				// a fresh attempt budget instead of the stale one.
				if (pendingSnapshot !== null) {
					attempts = 0;
					flush();
					return;
				}

				attempts += 1;
				if (attempts >= maxAttempts) {
					return;
				}

				pendingSnapshot = snapshot;
				const backoffMs = retryDelayMs * 2 ** (attempts - 1);
				cancelScheduledRetry = scheduler.schedule(() => {
					cancelScheduledRetry = null;
					flush();
				}, backoffMs);
			});
	}

	const unsubscribe = store.subscribe(
		(state) => ({
			elements: state.elements,
			connectLines: state.connectLines,
			canvasState: state.canvasState,
			themeId: state.theme.default.colors.id,
		}),
		(state) => {
			if (disposed) {
				return;
			}

			attempts = 0;
			pendingSnapshot = createPersistedDiagram(state);
			cancelRetry();
			flush();
		},
		{
			equalityFn: shallow,
		},
	);

	return () => {
		disposed = true;
		cancelRetry();
		unsubscribe();
	};
}
