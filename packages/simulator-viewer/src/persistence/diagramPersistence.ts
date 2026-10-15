import { get, set, setMany } from 'idb-keyval';
import { v1 } from 'uuid';
import { shallow } from 'zustand/shallow';
import {
	ConnectLine,
	Element,
	resultOperators,
	DiagramDocument,
	validateDiagramData,
	validateDiagramDocument,
	migrateLegacyDiagram,
	validateJsonData,
} from '@maklja/vision-simulator-model';
import { RootStore, StateProps } from '../store/rootStore';
import type { CanvasState } from '../store/stage';

export const LEGACY_DIAGRAM_KEY = 'test';
export const ACTIVE_DIAGRAM_KEY = 'vision:active-diagram';
export const LEGACY_BACKUP_KEY = 'vision:backup:legacy';
export const diagramKey = (id: string) => `vision:diagram:${id}`;
export const backupKey = (id: string) => `vision:backup:${id}`;

/** One writer per editor session; import/recovery queues behind any autosave already in flight. */
export class DiagramRepository {
	private queue: Promise<unknown> = Promise.resolve();
	private metadata?: Omit<DiagramDocument, 'diagram'>;

	documentForExport(data: StateProps): DiagramDocument {
		const now = new Date().toISOString();
		this.metadata ??= {
			schemaVersion: 1,
			id: v1(),
			name: 'My diagram',
			createdAt: now,
			updatedAt: now,
			origin: 'local',
		};
		return validateDiagramDocument({ ...this.metadata, diagram: data, updatedAt: now });
	}

	private remember(doc: DiagramDocument) {
		const { schemaVersion, id, name, createdAt, updatedAt, origin } = doc;
		this.metadata = { schemaVersion, id, name, createdAt, updatedAt, origin };
		return doc;
	}

	private enqueue<T>(action: () => Promise<T>): Promise<T> {
		const next = this.queue.then(action);
		this.queue = next.catch(() => undefined);
		return next;
	}

	private async active() {
		const id = await get<unknown>(ACTIVE_DIAGRAM_KEY);
		if (id === undefined) return undefined;
		if (typeof id !== 'string' || !id || id.length > 65_536)
			throw new Error('Invalid active diagram ID. Original storage was not changed.');
		const raw = await get<unknown>(diagramKey(id));
		if (raw === undefined)
			throw new Error('Active diagram record is missing. Original storage was not changed.');
		return { id, raw };
	}

	load(): Promise<DiagramDocument | undefined> {
		return this.enqueue(async () => {
			const active = await this.active();
			if (active) {
				const doc = validateDiagramDocument(active.raw);
				if (doc.id !== active.id)
					throw new Error('Diagram ID does not match its storage key.');
				return this.remember(doc);
			}
			const legacy = await get<unknown>(LEGACY_DIAGRAM_KEY);
			if (legacy === undefined) return undefined;
			const doc = migrateLegacyDiagram(legacy, v1(), new Date().toISOString());
			// Never publish the migrated record until the untouched source has a durable backup.
			await set(LEGACY_BACKUP_KEY, legacy);
			await setMany([
				[diagramKey(doc.id), doc],
				[ACTIVE_DIAGRAM_KEY, doc.id],
			]);
			return this.remember(doc);
		});
	}

	save(data: StateProps): Promise<DiagramDocument> {
		return this.enqueue(async () => {
			const diagram = validateDiagramData(data);
			const active = await this.active();
			const previous = active ? validateDiagramDocument(active.raw) : undefined;
			if (previous && previous.id !== active?.id) throw new Error('Diagram ID mismatch.');
			if (!active && (await get(LEGACY_DIAGRAM_KEY)) !== undefined)
				throw new Error('Load or recover the legacy diagram before saving.');
			const now = new Date().toISOString();
			const doc: DiagramDocument = previous
				? { ...previous, diagram, updatedAt: now }
				: {
						...this.documentForExport(diagram),
					};
			if (active) await set(backupKey(active.id), active.raw);
			await setMany([
				[diagramKey(doc.id), doc],
				[ACTIVE_DIAGRAM_KEY, doc.id],
			]);
			return this.remember(doc);
		});
	}

	/** Explicit replacement may recover invalid data; autosave above must never overwrite it. */
	replace(imported: DiagramDocument): Promise<DiagramDocument> {
		const checked = validateDiagramDocument(imported);
		return this.enqueue(async () => {
			const active = await this.active();
			const legacy = active ? undefined : await get<unknown>(LEGACY_DIAGRAM_KEY);
			const now = new Date().toISOString();
			const doc: DiagramDocument = {
				...checked,
				id: active?.id ?? v1(),
				origin: 'file',
				createdAt:
					this.metadata && active && this.metadata.id === active.id
						? this.metadata.createdAt
						: now,
				updatedAt: now,
			};
			if (active) await set(backupKey(active.id), active.raw);
			else if (legacy !== undefined) await set(LEGACY_BACKUP_KEY, legacy);
			await setMany([
				[diagramKey(doc.id), doc],
				[ACTIVE_DIAGRAM_KEY, doc.id],
			]);
			return this.remember(doc);
		});
	}

	readOriginal(): Promise<unknown> {
		return this.enqueue(async () => {
			const id = await get<unknown>(ACTIVE_DIAGRAM_KEY);
			if (id === undefined) return get(LEGACY_DIAGRAM_KEY);
			if (typeof id !== 'string') return { invalidActivePointer: id };
			return (await get(diagramKey(id))) ?? { missingRecord: id };
		});
	}

	readBackup(): Promise<unknown> {
		return this.enqueue(async () => {
			const active = await this.active();
			return (
				(active ? await get(backupKey(active.id)) : undefined) ??
				(await get(LEGACY_BACKUP_KEY))
			);
		});
	}
}

const defaultRepository = new DiagramRepository();

export interface PersistableDiagramState {
	elements: Record<string, Element>;
	connectLines: Record<string, ConnectLine>;
	canvasState: Pick<CanvasState, 'x' | 'y' | 'scaleX' | 'scaleY'> & Partial<CanvasState>;
	themeId: string;
}

export function createPersistedDiagram(state: PersistableDiagramState): StateProps {
	// Project each record explicitly: selection/highlight and future runtime fields cannot leak.
	const elements = Object.values(state.elements)
		.filter((el) => !resultOperators.has(el.type))
		.map((el) => ({
			id: el.id,
			type: el.type,
			name: el.name,
			x: el.x,
			y: el.y,
			visible: el.visible,
			properties: Object.fromEntries(
				Object.entries(el.properties).filter(([, value]) => value !== undefined),
			),
		}));
	const diagram: StateProps = {
		elements,
		connectLines: Object.values(state.connectLines).map((line) => ({
			id: line.id,
			name: line.name,
			index: line.index,
			locked: line.locked,
			points: line.points.map(({ x, y }) => ({ x, y })),
			source: {
				id: line.source.id,
				connectPointType: line.source.connectPointType,
				connectPosition: line.source.connectPosition,
			},
			target: {
				id: line.target.id,
				connectPointType: line.target.connectPointType,
				connectPosition: line.target.connectPosition,
			},
		})),
		canvasState: {
			x: state.canvasState.x,
			y: state.canvasState.y,
			scaleX: state.canvasState.scaleX,
			scaleY: state.canvasState.scaleY,
		},
		themeId: state.themeId,
	};
	validateJsonData(diagram);
	return JSON.parse(JSON.stringify(diagram)) as StateProps;
}

export async function loadDiagram(): Promise<StateProps | undefined> {
	return (await defaultRepository.load())?.diagram;
}

export async function persistDiagram(diagram: StateProps): Promise<void> {
	await defaultRepository.save(diagram);
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
	save?: (diagram: StateProps) => Promise<unknown>;
	onSaved?: () => void;
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
		save = persistDiagram,
		onSaved,
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

		save(snapshot)
			.then(() => {
				writing = false;
				if (disposed) return;
				onSaved?.();
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
			try {
				pendingSnapshot = createPersistedDiagram(state);
			} catch (error) {
				pendingSnapshot = null;
				onError(error);
				return;
			}
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
