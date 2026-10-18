import { expect, test } from '@playwright/test';
import {
	bootstrapEditor,
	selectEntryOperator,
	simulationResults,
	startSimulation,
} from './support/editor';
import { currentReleaseDiagram } from '../packages/simulator-model/test/fixtures/currentReleaseDiagram';
import { currentDiagramDocument } from '../packages/simulator-model/test/fixtures/currentDiagramDocument';
import { waitForDiagramCounts } from './support/indexedDb';
import { installWorkerProbe, readWorkerProbe } from './support/workerProbe';

test('imports inertly, requires session approval again after reload, and exports versioned source data', async ({
	page,
}) => {
	await installWorkerProbe(page);
	await bootstrapEditor(page);
	const doc = currentDiagramDocument(
		currentReleaseDiagram,
		'file-source-id',
		'2026-10-15T19:00:00Z',
	);
	await page.getByText('Diagram files', { exact: true }).click();
	await page.getByLabel('Import diagram JSON').setInputFiles({
		name: 'diagram.json',
		mimeType: 'application/json',
		buffer: Buffer.from(JSON.stringify(doc)),
	});
	await expect(
		page.getByRole('button', { name: 'Allow execution for this revision' }),
	).toBeVisible();
	await waitForDiagramCounts(page, 3, 2);
	await expect(page.getByLabel('simulation results')).toHaveText('');
	expect((await readWorkerProbe(page)).created).toBe(0);
	const source = currentReleaseDiagram.elements[0];
	await selectEntryOperator(page, source);
	await expect(page.getByRole('button', { name: 'start simulation' })).toBeDisabled();
	await page.getByRole('button', { name: 'Allow execution for this revision' }).click();
	await startSimulation(page);
	await expect(simulationResults(page)).toHaveText('10, 20, 30');

	await page.reload();
	await expect(
		page.getByRole('button', { name: 'Allow execution for this revision' }),
	).toBeVisible();
	await expect(page.getByLabel('simulation results')).toHaveText('');
	await page.getByText('Diagram files', { exact: true }).click();
	const downloadPromise = page.waitForEvent('download');
	await page.getByRole('button', { name: 'Export diagram JSON' }).click();
	const download = await downloadPromise;
	const stream = await download.createReadStream();
	const chunks = [];
	for await (const chunk of stream!) chunks.push(chunk);
	const exported = JSON.parse(Buffer.concat(chunks).toString());
	expect(exported.schemaVersion).toBe(2);
	expect(exported.origin).toBe('file');
	expect(exported.diagram).toEqual(currentReleaseDiagram);
	expect(exported).not.toHaveProperty('trusted');
	expect(exported).not.toHaveProperty('simulation');
});

test('reports invalid import without changing the saved diagram', async ({ page }) => {
	await bootstrapEditor(page);
	await page.getByText('Diagram files', { exact: true }).click();
	await page.getByLabel('Import diagram JSON').setInputFiles({
		name: 'future.json',
		mimeType: 'application/json',
		buffer: Buffer.from('{"schemaVersion":99}'),
	});
	await expect(page.locator('details').getByRole('status')).toContainText('unsupported version');
	await expect(
		page.getByRole('button', { name: 'Allow execution for this revision' }),
	).not.toBeVisible();
});

test('rejects old development storage and logs a browser console error without loading it', async ({
	page,
}) => {
	await bootstrapEditor(page);
	await page.evaluate(async (legacy) => {
		await new Promise<void>((resolve, reject) => {
			const open = indexedDB.open('keyval-store');
			open.onerror = () => reject(open.error);
			open.onsuccess = () => {
				const db = open.result;
				const tx = db.transaction('keyval', 'readwrite');
				tx.objectStore('keyval').clear();
				tx.objectStore('keyval').put(legacy, 'test');
				tx.oncomplete = () => {
					db.close();
					resolve();
				};
				tx.onerror = () => reject(tx.error);
			};
		});
	}, currentReleaseDiagram);
	const errors: string[] = [];
	page.on('console', (message) => {
		if (message.type() === 'error') errors.push(message.text());
	});
	await page.reload();
	await expect(page.getByTestId('simulator-stage')).toBeVisible();
	await expect
		.poll(() => errors.some((message) => message.includes('Unsupported legacy diagram')))
		.toBe(true);
	await expect(page.getByRole('button', { name: 'start simulation' })).toBeDisabled();
	await page.getByRole('combobox', { name: 'Entry operator' }).click();
	await expect(page.getByRole('option')).toHaveCount(0);
});
