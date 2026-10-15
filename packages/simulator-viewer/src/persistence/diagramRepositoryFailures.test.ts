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

	it('preserves the previous record and downloadable backup after a failed replacement commit', async () => {
		const repository = new DiagramRepository();
		const previous = await repository.save(currentReleaseDiagram);
		vi.mocked(keyval.setMany).mockRejectedValueOnce(new Error('commit failed'));
		await expect(repository.replace(imported())).rejects.toThrow('commit failed');
		expect(await repository.readOriginal()).toEqual(previous);
		expect(await keyval.get(backupKey(previous.id))).toEqual(previous);
	});

	it('never allows direct save to bypass legacy migration/backup', async () => {
		await keyval.set(LEGACY_DIAGRAM_KEY, currentReleaseDiagram);
		await expect(new DiagramRepository().save(currentReleaseDiagram)).rejects.toThrow('legacy');
		expect(await keyval.get(ACTIVE_DIAGRAM_KEY)).toBeUndefined();
	});
});
