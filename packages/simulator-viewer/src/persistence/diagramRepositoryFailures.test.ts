import 'fake-indexeddb/auto';
import * as keyval from 'idb-keyval';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { migrateLegacyDiagram } from '@maklja/vision-simulator-model';
import { currentReleaseDiagram } from '../../../simulator-model/test/fixtures/currentReleaseDiagram';
import {
	ACTIVE_DIAGRAM_KEY,
	backupKey,
	diagramKey,
	DiagramRepository,
	LEGACY_BACKUP_KEY,
	LEGACY_DIAGRAM_KEY,
} from './diagramPersistence';

vi.mock('idb-keyval', async (importOriginal) => {
	const actual = await importOriginal<typeof import('idb-keyval')>();
	return { ...actual, set: vi.fn(actual.set), setMany: vi.fn(actual.setMany) };
});

const imported = () =>
	migrateLegacyDiagram(currentReleaseDiagram, 'file-id', '2026-10-15T19:00:00Z');

describe('durable backup ordering and failure recovery', () => {
	beforeEach(async () => {
		await keyval.clear();
	});
	afterEach(async () => {
		const actual = await vi.importActual<typeof import('idb-keyval')>('idb-keyval');
		vi.mocked(keyval.set).mockReset().mockImplementation(actual.set);
		vi.mocked(keyval.setMany).mockReset().mockImplementation(actual.setMany);
	});

	it('never publishes migration when backup fails; retry succeeds from the intact original', async () => {
		await keyval.set(LEGACY_DIAGRAM_KEY, currentReleaseDiagram);
		const repository = new DiagramRepository();
		const backup = vi.mocked(keyval.set).mockRejectedValueOnce(new Error('backup full'));
		await expect(repository.load()).rejects.toThrow('backup full');
		expect(await keyval.get(ACTIVE_DIAGRAM_KEY)).toBeUndefined();
		expect(await keyval.get(LEGACY_DIAGRAM_KEY)).toEqual(currentReleaseDiagram);
		backup.mockReset();
		backup.mockImplementation(
			(await vi.importActual<typeof import('idb-keyval')>('idb-keyval')).set,
		);
		expect((await repository.load())?.diagram).toEqual(currentReleaseDiagram);
	});

	it('retains both source and backup if the migration commit fails', async () => {
		await keyval.set(LEGACY_DIAGRAM_KEY, currentReleaseDiagram);
		vi.mocked(keyval.setMany).mockRejectedValueOnce(new Error('transaction failed'));
		await expect(new DiagramRepository().load()).rejects.toThrow('transaction failed');
		expect(await keyval.get(ACTIVE_DIAGRAM_KEY)).toBeUndefined();
		expect(await keyval.get(LEGACY_BACKUP_KEY)).toEqual(currentReleaseDiagram);
		expect(await keyval.get(LEGACY_DIAGRAM_KEY)).toEqual(currentReleaseDiagram);
	});

	it.each(['save', 'replace'] as const)(
		'preserves the previous record when %s backup fails',
		async (mode) => {
			const repository = new DiagramRepository();
			const previous = await repository.save(currentReleaseDiagram);
			vi.mocked(keyval.set).mockRejectedValueOnce(new Error('backup failed'));
			const change =
				mode === 'save'
					? repository.save({ ...currentReleaseDiagram, themeId: 'winter' })
					: repository.replace(imported());
			await expect(change).rejects.toThrow('backup failed');
			expect(await keyval.get(diagramKey(previous.id))).toEqual(previous);
			expect(await keyval.get(ACTIVE_DIAGRAM_KEY)).toBe(previous.id);
		},
	);

	it('preserves the previous record and internal backup after a failed replacement commit', async () => {
		const repository = new DiagramRepository();
		const previous = await repository.save(currentReleaseDiagram);
		vi.mocked(keyval.setMany).mockRejectedValueOnce(new Error('commit failed'));
		await expect(repository.replace(imported())).rejects.toThrow('commit failed');
		expect(await keyval.get(diagramKey(previous.id))).toEqual(previous);
		expect(await keyval.get(backupKey(previous.id))).toEqual(previous);
	});

	it('never allows direct save to bypass legacy migration/backup', async () => {
		await keyval.set(LEGACY_DIAGRAM_KEY, currentReleaseDiagram);
		await expect(new DiagramRepository().save(currentReleaseDiagram)).rejects.toThrow('legacy');
		expect(await keyval.get(ACTIVE_DIAGRAM_KEY)).toBeUndefined();
	});
});

import { RECOVERY_BACKUP_KEY } from './diagramPersistence';

describe('explicit replacement of invalid active storage', () => {
	beforeEach(async () => {
		await keyval.clear();
	});
	afterEach(async () => {
		const actual = await vi.importActual<typeof import('idb-keyval')>('idb-keyval');
		vi.mocked(keyval.set).mockReset().mockImplementation(actual.set);
		vi.mocked(keyval.setMany).mockReset().mockImplementation(actual.setMany);
	});

	it.each([42, { broken: true }, '', 'missing-record', '__proto__'])(
		'backs up corrupt pointer %j and imports under a fresh ID',
		async (pointer) => {
			await keyval.set(ACTIVE_DIAGRAM_KEY, pointer);
			await keyval.set(LEGACY_DIAGRAM_KEY, currentReleaseDiagram);
			const repository = new DiagramRepository();
			await expect(repository.load()).rejects.toThrow();
			await expect(repository.save(currentReleaseDiagram)).rejects.toThrow();
			const recovered = await repository.replace(imported());
			expect(recovered.id).not.toBe(pointer);
			expect(recovered.origin).toBe('file');
			expect(await keyval.get(RECOVERY_BACKUP_KEY)).toEqual({
				activePointer: pointer,
				record: undefined,
			});
			expect(await new DiagramRepository().load()).toEqual(recovered);
			expect(await keyval.get(LEGACY_DIAGRAM_KEY)).toEqual(currentReleaseDiagram);
		},
	);

	it('does not change an invalid pointer when its recovery backup fails', async () => {
		await keyval.set(ACTIVE_DIAGRAM_KEY, { broken: true });
		vi.mocked(keyval.set).mockRejectedValueOnce(new Error('backup failed'));
		await expect(new DiagramRepository().replace(imported())).rejects.toThrow('backup failed');
		expect(await keyval.get(ACTIVE_DIAGRAM_KEY)).toEqual({ broken: true });
	});

	it('preserves the corrupt pointer snapshot if replacement commit fails and succeeds on retry', async () => {
		await keyval.set(ACTIVE_DIAGRAM_KEY, 'missing-record');
		vi.mocked(keyval.setMany).mockRejectedValueOnce(new Error('commit failed'));
		const repository = new DiagramRepository();
		await expect(repository.replace(imported())).rejects.toThrow('commit failed');
		expect(await keyval.get(ACTIVE_DIAGRAM_KEY)).toBe('missing-record');
		expect(await keyval.get(RECOVERY_BACKUP_KEY)).toEqual({
			activePointer: 'missing-record',
			record: undefined,
		});
		await repository.replace(imported());
		expect((await repository.load())?.diagram).toEqual(currentReleaseDiagram);
	});
});

import { schemaBackupKey } from './diagramPersistence';

it('preserves the released v1 record if its schema backup fails and retains the original after later autosaves', async () => {
	await keyval.clear();
	const v1 = {
		...imported(),
		schemaVersion: 1,
		diagram: {
			...currentReleaseDiagram,
			elements: [
				{
					...currentReleaseDiagram.elements[0],
					type: 'range',
					properties: { start: 0, count: 2 },
				},
			],
			connectLines: [],
		},
	};
	await keyval.set(ACTIVE_DIAGRAM_KEY, v1.id);
	await keyval.set(diagramKey(v1.id), v1);
	const actual = await vi.importActual<typeof import('idb-keyval')>('idb-keyval');
	vi.mocked(keyval.set).mockRejectedValueOnce(new Error('schema backup failed'));
	await expect(new DiagramRepository().load()).rejects.toThrow('schema backup failed');
	expect(await keyval.get(diagramKey(v1.id))).toEqual(v1);
	vi.mocked(keyval.set).mockImplementation(actual.set);
	const repo = new DiagramRepository();
	const migrated = (await repo.load())!;
	expect(migrated.schemaVersion).toBe(2);
	expect(await keyval.get(schemaBackupKey(v1.id))).toEqual(v1);
	await repo.save({ ...migrated.diagram, themeId: 'winter' });
	expect(await keyval.get(schemaBackupKey(v1.id))).toEqual(v1);
	expect(await new DiagramRepository().load()).toMatchObject({ schemaVersion: 2 });
});
