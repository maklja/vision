import { currentDiagramDocument } from '../../packages/simulator-model/test/fixtures/currentDiagramDocument';
import { expect, Page } from '@playwright/test';
import { PersistedDiagram } from './diagram';

/** IndexedDB coordinates used by the viewer's `idb-keyval` persistence. */
export const DIAGRAM_DATABASE = 'keyval-store';
export const DIAGRAM_STORE = 'keyval';
export const DIAGRAM_KEY = 'test';

interface KeyvalCoordinates {
	database: string;
	store: string;
	key: string;
}

const coordinates: KeyvalCoordinates = {
	database: DIAGRAM_DATABASE,
	store: DIAGRAM_STORE,
	key: DIAGRAM_KEY,
};

export async function readPersistedDiagram(page: Page): Promise<PersistedDiagram | undefined> {
	return page.evaluate(
		({ database, store, key }) =>
			new Promise<PersistedDiagram | undefined>((resolve, reject) => {
				const openRequest = indexedDB.open(database);
				openRequest.onerror = () => reject(openRequest.error);
				openRequest.onsuccess = () => {
					const database = openRequest.result;
					if (!database.objectStoreNames.contains(store)) {
						database.close();
						resolve(undefined);
						return;
					}

					const transaction = database.transaction(store, 'readonly');
					const objectStore = transaction.objectStore(store);
					const pointer = objectStore.get('vision:active-diagram');
					pointer.onerror = () => reject(pointer.error);
					pointer.onsuccess = () => {
						const versioned = typeof pointer.result === 'string';
						const request = objectStore.get(
							versioned ? `vision:diagram:${pointer.result}` : key,
						);
						request.onerror = () => reject(request.error);
						request.onsuccess = () =>
							resolve(versioned ? request.result?.diagram : request.result);
					};
					transaction.oncomplete = () => database.close();
				};
			}),
		coordinates,
	);
}

export async function seedPersistedDiagram(page: Page, diagram: PersistedDiagram): Promise<void> {
	await page.evaluate(
		({ database, store, value }) =>
			new Promise<void>((resolve, reject) => {
				const openRequest = indexedDB.open(database);
				openRequest.onerror = () => reject(openRequest.error);
				openRequest.onupgradeneeded = () => {
					const database = openRequest.result;
					if (!database.objectStoreNames.contains(store)) {
						database.createObjectStore(store);
					}
				};
				openRequest.onsuccess = () => {
					const database = openRequest.result;
					const transaction = database.transaction(store, 'readwrite');
					transaction.oncomplete = () => {
						database.close();
						resolve();
					};
					transaction.onerror = () => reject(transaction.error);
					transaction.objectStore(store).clear();
					transaction.objectStore(store).put(value, `vision:diagram:${value.id}`);
					transaction.objectStore(store).put(value.id, 'vision:active-diagram');
				};
			}),
		{ ...coordinates, value: currentDiagramDocument(diagram) },
	);
}

export async function clearPersistedDiagram(page: Page): Promise<void> {
	await page.evaluate(
		({ database, store, key }) =>
			new Promise<void>((resolve, reject) => {
				const openRequest = indexedDB.open(database);
				openRequest.onerror = () => reject(openRequest.error);
				openRequest.onsuccess = () => {
					const database = openRequest.result;
					if (!database.objectStoreNames.contains(store)) {
						database.close();
						resolve();
						return;
					}

					const transaction = database.transaction(store, 'readwrite');
					transaction.oncomplete = () => {
						database.close();
						resolve();
					};
					transaction.onerror = () => reject(transaction.error);
					transaction.objectStore(store).clear();
				};
			}),
		coordinates,
	);
}

/** Polls persisted state until the predicate is satisfied, then returns the captured diagram. */
export async function waitForDiagram(
	page: Page,
	predicate: (diagram: PersistedDiagram | undefined) => boolean,
	options: { timeout?: number } = {},
): Promise<PersistedDiagram> {
	await expect.poll(async () => predicate(await readPersistedDiagram(page)), options).toBe(true);

	const diagram = await readPersistedDiagram(page);
	if (!diagram) {
		throw new Error('Persisted diagram disappeared while polling');
	}

	return diagram;
}

export async function waitForDiagramCounts(
	page: Page,
	elements: number,
	connectLines: number,
): Promise<PersistedDiagram> {
	return waitForDiagram(
		page,
		(diagram) =>
			(diagram?.elements.length ?? 0) === elements &&
			(diagram?.connectLines.length ?? 0) === connectLines,
	);
}
