// @vitest-environment jsdom

import 'fake-indexeddb/auto';
import { clear, get, set } from 'idb-keyval';
import { beforeEach, describe, expect, it } from 'vitest';
import { ElementType } from '@maklja/vision-simulator-model';
import { createConnectLine, createElement } from '../test-utils';
import {
	createPersistedDiagram,
	ACTIVE_DIAGRAM_KEY,
	diagramKey,
	LEGACY_DIAGRAM_KEY,
	LEGACY_BACKUP_KEY,
	DiagramRepository,
	backupKey,
	loadDiagram,
	persistDiagram,
} from './diagramPersistence';

describe('diagram persistence helpers', () => {
	beforeEach(async () => {
		await clear();
	});

	it('uses a versioned active record instead of overwriting the legacy key', () => {
		expect(ACTIVE_DIAGRAM_KEY).not.toBe(LEGACY_DIAGRAM_KEY);
	});

	it('serializes elements and connect lines as arrays in the stored shape', () => {
		const persisted = createPersistedDiagram({
			elements: {
				source: createElement(ElementType.Of, { id: 'source' }),
				transformation: createElement(ElementType.Map, { id: 'transformation' }),
			},
			connectLines: {
				'source-transformation': createConnectLine({ id: 'source-transformation' }),
			},
			canvasState: { x: 10, y: 20, scaleX: 2, scaleY: 3, width: 0, height: 0 },
			themeId: 'winter',
		});

		expect(Array.isArray(persisted.elements)).toBe(true);
		expect(Array.isArray(persisted.connectLines)).toBe(true);
		expect(persisted).toEqual({
			elements: [
				createElement(ElementType.Of, { id: 'source' }),
				createElement(ElementType.Map, { id: 'transformation' }),
			],
			connectLines: [createConnectLine({ id: 'source-transformation' })],
			canvasState: { x: 10, y: 20, scaleX: 2, scaleY: 3 },
			themeId: 'winter',
		});
	});

	it('excludes transient result elements while preserving editor elements', () => {
		const persisted = createPersistedDiagram({
			elements: {
				source: createElement(ElementType.Of, { id: 'source' }),
				transient: createElement(ElementType.Result, { id: 'transient' }),
			},
			connectLines: {},
			canvasState: { x: 0, y: 0, scaleX: 1, scaleY: 1 },
			themeId: 'sea',
		});

		expect(persisted.elements.map((element) => element.id)).toEqual(['source']);
	});

	it('returns no diagram when nothing is stored', async () => {
		await expect(loadDiagram()).resolves.toBeUndefined();
	});

	it('round-trips a persisted diagram through IndexedDB', async () => {
		const persisted = createPersistedDiagram({
			elements: { source: createElement(ElementType.Of, { id: 'source' }) },
			connectLines: {},
			canvasState: { x: 1, y: 2, scaleX: 3, scaleY: 4 },
			themeId: 'beige',
		});

		await persistDiagram(persisted);

		await expect(loadDiagram()).resolves.toEqual(persisted);
	});
});

import { currentReleaseDiagram } from '../../../simulator-model/test/fixtures/currentReleaseDiagram';
import { migrateLegacyDiagram } from '@maklja/vision-simulator-model';

const releaseDoc = () =>
	migrateLegacyDiagram(
		structuredClone(currentReleaseDiagram),
		'release',
		'2026-10-15T19:00:00.000Z',
	);

describe('versioned IndexedDB repository', () => {
	beforeEach(async () => {
		await clear();
	});

	it('backs up and migrates legacy storage idempotently without overwriting the original', async () => {
		await set(LEGACY_DIAGRAM_KEY, currentReleaseDiagram);
		const repository = new DiagramRepository();
		const first = await repository.load();
		expect(first?.diagram).toEqual(currentReleaseDiagram);
		expect(await get(LEGACY_BACKUP_KEY)).toEqual(currentReleaseDiagram);
		expect(await get(LEGACY_DIAGRAM_KEY)).toEqual(currentReleaseDiagram);
		expect(await new DiagramRepository().load()).toEqual(first);
	});

	it('backs up the prior record, retains stable metadata and excludes grants from autosave', async () => {
		const repository = new DiagramRepository();
		const exported = repository.documentForExport(currentReleaseDiagram);
		const first = await repository.save(currentReleaseDiagram);
		expect(first.id).toBe(exported.id);
		expect(first.createdAt).toBe(exported.createdAt);
		const changed = structuredClone(currentReleaseDiagram);
		changed.canvasState.x = 999;
		const second = await repository.save(changed);
		expect(second.id).toBe(first.id);
		expect(second.createdAt).toBe(first.createdAt);
		expect(await get(backupKey(first.id))).toEqual(first);
		expect(await get(ACTIVE_DIAGRAM_KEY)).toBe(first.id);
		expect(await get(diagramKey(first.id))).toEqual(second);
	});

	it('blocks autosave for future/corrupt data, permits explicit import only after backing it up', async () => {
		const invalid = { ...releaseDoc(), schemaVersion: 99 };
		await set(ACTIVE_DIAGRAM_KEY, 'release');
		await set(diagramKey('release'), invalid);
		const repository = new DiagramRepository();
		await expect(repository.load()).rejects.toThrow('unsupported version');
		await expect(repository.save(currentReleaseDiagram)).rejects.toThrow('unsupported version');
		expect(await get(diagramKey('release'))).toEqual(invalid);
		const imported = await repository.replace(releaseDoc());
		expect(imported.origin).toBe('file');
		expect(imported.id).toBe('release');
		expect(await get(backupKey('release'))).toEqual(invalid);
	});

	it('keeps imported provenance across autosaves and reload; a file cannot grant permission', async () => {
		const repository = new DiagramRepository();
		const imported = await repository.replace({ ...releaseDoc(), origin: 'local' });
		const saved = await repository.save(imported.diagram);
		expect(saved.origin).toBe('file');
		expect((await new DiagramRepository().load())?.origin).toBe('file');
		expect(saved.id).not.toBe('release');
	});

	it('queues replacement after an autosave without resurrecting its source afterwards', async () => {
		const repository = new DiagramRepository();
		const save = repository.save({ ...currentReleaseDiagram, themeId: 'winter' });
		const replace = repository.replace(releaseDoc());
		await save;
		await replace;
		expect((await repository.load())?.diagram.themeId).toBe('sea');
	});

	it('refuses corrupt legacy data without creating a new active record', async () => {
		await set(LEGACY_DIAGRAM_KEY, { elements: 'broken' });
		await expect(new DiagramRepository().load()).rejects.toThrow();
		expect(await get(ACTIVE_DIAGRAM_KEY)).toBeUndefined();
		expect(await get(LEGACY_DIAGRAM_KEY)).toEqual({ elements: 'broken' });
	});
});

it('roundtrips only the finite context seed through versioned save/export/import', async () => {
	await clear();
	const repository = new DiagramRepository();
	const diagram = {
		elements: [],
		connectLines: [],
		canvasState: { x: 0, y: 0, scaleX: 1, scaleY: 1 },
		themeId: 'sea',
		contextSeed: { seen: 0, nested: { value: 1 } },
	};
	const saved = await repository.save(diagram);
	const imported = await new DiagramRepository().replace(saved);
	expect(imported.diagram.contextSeed).toEqual(diagram.contextSeed);
	expect(repository.documentForExport(diagram).diagram.contextSeed).toEqual(diagram.contextSeed);
	expect(Object.keys(saved.diagram)).not.toContain('context');
	expect(Object.keys(saved)).not.toContain('trusted');
});
