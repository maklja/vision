import { expect, test } from '@playwright/test';
import { ElementType } from '@maklja/vision-simulator-model';
import { basePathFixture } from './support/fixtures';
import {
	bootstrapEditorWithDiagram,
	selectElement,
	selectEntryOperator,
	simulationResults,
	startSimulation,
} from './support/editor';
import { waitForDiagram } from './support/indexedDb';
import { installWorkerProbe, waitForWorkerProbe } from './support/workerProbe';

test('typed Range drafts switch by keyboard, require trust and round-trip only the active expression', async ({
	page,
}) => {
	await installWorkerProbe(page);
	const source = {
		...basePathFixture.elements[0],
		type: ElementType.Range,
		properties: { start: 5, count: 2 },
	};
	await bootstrapEditorWithDiagram(page, {
		...basePathFixture,
		elements: [source, basePathFixture.elements[1]],
	});
	await selectEntryOperator(page, source);
	await selectElement(page, source);
	const mode = page.getByRole('combobox', { name: 'Count mode', exact: true });
	await mode.focus();
	await page.keyboard.press('ArrowDown');
	await page.getByRole('option', { name: 'Expression', exact: true }).click();
	await expect(page.getByLabel('Count expression', { exact: true })).toHaveAttribute(
		'aria-invalid',
		'true',
	);
	await expect(page.getByRole('button', { name: 'start simulation' })).toBeDisabled();
	await page.getByLabel('Count expression', { exact: true }).fill('1 +');
	await expect(page.getByLabel('Count expression', { exact: true })).toHaveAttribute(
		'aria-invalid',
		'true',
	);
	await page.getByLabel('Count expression', { exact: true }).fill('2');
	await expect(
		page.getByRole('button', { name: 'Allow execution for this revision' }),
	).toBeVisible();
	await mode.click();
	await page.getByRole('option', { name: 'Literal', exact: true }).click();
	await expect(page.getByLabel('Count', { exact: true })).toHaveValue('2');
	await page.getByLabel('Count', { exact: true }).fill('3');
	await mode.click();
	await page.getByRole('option', { name: 'Expression', exact: true }).click();
	await expect(page.getByLabel('Count expression', { exact: true })).toHaveValue('2');
	const saved = await waitForDiagram(
		page,
		(data) => (data?.elements[0].properties.count as { kind?: string })?.kind === 'expression',
	);
	expect(saved.elements[0].properties.count).toEqual({
		kind: 'expression',
		type: 'number',
		source: '2',
	});
	await startSimulation(page);
	await expect(simulationResults(page)).toHaveText('5, 6');
	await waitForWorkerProbe(page, (probe) =>
		probe.inbound.some((message) => message.type === 'complete'),
	);
	await page.reload();
	await selectElement(page, source);
	await selectEntryOperator(page, source);
	await expect(page.getByLabel('Count expression', { exact: true })).toHaveValue('2');
	await expect(page.getByRole('button', { name: 'start simulation' })).toBeDisabled();
	await startSimulation(page);
	await expect(simulationResults(page)).toHaveText('5, 6');
});

test('wrong expression results are diagnosed by field', async ({ page }) => {
	const source = {
		...basePathFixture.elements[0],
		type: ElementType.Range,
		properties: { start: 0, count: 1 },
	};
	await bootstrapEditorWithDiagram(page, {
		...basePathFixture,
		elements: [source, basePathFixture.elements[1]],
	});
	await selectElement(page, source);
	await page.getByRole('combobox', { name: 'Count mode', exact: true }).click();
	await page.getByRole('option', { name: 'Expression', exact: true }).click();
	await page.getByLabel('Count expression', { exact: true }).fill('"2"');
	await selectEntryOperator(page, source);
	await startSimulation(page);
	await page.getByText('Execution settings and diagnostics', { exact: true }).click();
	await expect(page.getByLabel('Execution diagnostics')).toContainText('count');
	await expect(page.getByLabel('Execution diagnostics')).toContainText('result');
});

test('invalid expression drafts preserve the last valid value after reload', async ({ page }) => {
	const source = {
		...basePathFixture.elements[0],
		type: ElementType.Range,
		properties: { start: 0, count: 2 },
	};
	await bootstrapEditorWithDiagram(page, {
		...basePathFixture,
		elements: [source, basePathFixture.elements[1]],
	});
	await selectEntryOperator(page, source);
	await selectElement(page, source);
	await page.getByRole('combobox', { name: 'Count mode', exact: true }).click();
	await page.getByRole('option', { name: 'Expression', exact: true }).click();
	await page.getByLabel('Count expression', { exact: true }).fill('1 +');
	await expect(page.getByText(/valid JavaScript value expression/)).toBeVisible();
	await expect(page.getByRole('button', { name: 'start simulation' })).toBeDisabled();
	await page.getByLabel('Start', { exact: true }).fill('1');
	const savedLiteral = await waitForDiagram(
		page,
		(data) => (data?.elements[0].properties.start as { value?: number })?.value === 1,
	);
	expect(savedLiteral.elements[0].properties.count).toEqual({
		kind: 'literal',
		type: 'number',
		value: 2,
	});
	await page.reload();
	await selectElement(page, source);
	await expect(page.getByLabel('Count', { exact: true })).toHaveValue('2');
	await page.getByRole('combobox', { name: 'Count mode', exact: true }).click();
	await page.getByRole('option', { name: 'Expression', exact: true }).click();
	await page.getByLabel('Count expression', { exact: true }).fill('3');
	await waitForDiagram(
		page,
		(data) => (data?.elements[0].properties.count as { source?: string })?.source === '3',
	);
	await page.getByLabel('Count expression', { exact: true }).fill('3 +');
	await expect(page.getByText(/valid JavaScript value expression/)).toBeVisible();
	await page.getByLabel('Start', { exact: true }).fill('2');
	const savedExpression = await waitForDiagram(
		page,
		(data) => (data?.elements[0].properties.start as { value?: number })?.value === 2,
	);
	expect(savedExpression.elements[0].properties.count).toEqual({
		kind: 'expression',
		type: 'number',
		source: '3',
	});
	await page.reload();
	await selectElement(page, source);
	await expect(page.getByLabel('Count expression', { exact: true })).toHaveValue('3');
	await expect(page.getByLabel('Count expression', { exact: true })).toHaveAttribute(
		'aria-invalid',
		'false',
	);
});
