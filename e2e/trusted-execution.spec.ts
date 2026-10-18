import { expect, test } from '@playwright/test';
import { basePathFixture } from './support/fixtures';
import {
	bootstrapEditorWithDiagram,
	selectEntryOperator,
	simulationResults,
	startSimulation,
} from './support/editor';
import { installWorkerProbe, waitForWorkerProbe } from './support/workerProbe';

function fixture(source: string) {
	return {
		...basePathFixture,
		elements: [
			{ ...basePathFixture.elements[0], properties: { argsFactoryExpression: source } },
			basePathFixture.elements[1],
		],
	};
}

test('local code is inert until approved and each restart clones the seed', async ({ page }) => {
	await installWorkerProbe(page);
	const diagram = fixture('() => [++$context.seen]');
	await bootstrapEditorWithDiagram(page, diagram);
	await selectEntryOperator(page, diagram.elements[0]);
	await page.getByText('Execution settings and diagnostics', { exact: true }).click();
	await page.getByLabel('Context seed', { exact: true }).fill('{"seen":0}');
	await expect(page.getByRole('button', { name: 'start simulation' })).toBeDisabled();
	await startSimulation(page);
	await expect(simulationResults(page).getByText('1', { exact: true })).toBeVisible();
	await startSimulation(page);
	await waitForWorkerProbe(
		page,
		(probe) => probe.inbound.filter((message) => message.type === 'complete').length === 2,
	);
	await expect(simulationResults(page).getByText('1', { exact: true })).toBeVisible();
	await expect(page.getByLabel('Context seed', { exact: true })).toHaveValue('{"seen":0}');
	await page.reload();
	await expect(
		page.getByRole('button', { name: 'Allow execution for this revision' }),
	).toBeVisible();
});

test('watchdog terminates an infinite synchronous callback and the controls remain usable', async ({
	page,
}) => {
	const diagram = fixture('() => { while (true) {} }');
	await bootstrapEditorWithDiagram(page, diagram);
	await selectEntryOperator(page, diagram.elements[0]);
	await page.getByText('Execution settings and diagnostics', { exact: true }).click();
	await page.getByLabel('Watchdog seconds', { exact: true }).fill('1');
	await startSimulation(page);
	await expect(page.getByLabel('Execution diagnostics')).toContainText('watchdog');
	await expect(page.getByRole('button', { name: 'start simulation' })).toBeEnabled();
});
