import { expect, test } from '@playwright/test';
import {
	DueDateType,
	ElementType,
	fromOperatorDefinition,
	timerOperatorDefinition,
} from '@maklja/vision-simulator-model';
import {
	bootstrapEditorWithDiagram,
	selectElement,
	selectEntryOperator,
	simulationResults,
	startSimulation,
} from './support/editor';
import { infiniteSourceFixture } from './support/fixtures';
import { installWorkerProbe, waitForWorkerProbe } from './support/workerProbe';
import { readPersistedDiagram, waitForDiagram } from './support/indexedDb';

function sourceFixture(type: ElementType, properties: Record<string, unknown>) {
	const source = { ...infiniteSourceFixture.elements[0], type, name: `${type}_0`, properties };
	return {
		...infiniteSourceFixture,
		elements: [source, infiniteSourceFixture.elements[1]],
	};
}

test('From mode changes preserve both callback fields and run the literal input in the Worker', async ({
	page,
}) => {
	await installWorkerProbe(page);
	const diagram = sourceFixture(ElementType.From, { ...fromOperatorDefinition.defaults });
	const source = diagram.elements[0];
	await bootstrapEditorWithDiagram(page, diagram);
	await selectElement(page, source);
	const connectedMode = page.getByRole('checkbox', { name: 'Observable event' });
	await expect(connectedMode).toBeChecked();
	await connectedMode.uncheck();
	await waitForDiagram(
		page,
		(saved) => saved?.elements[0]?.properties.enableObservableEvent === false,
	);
	await selectEntryOperator(page, source);
	await startSimulation(page);
	await expect(simulationResults(page)).toHaveText('1, 2, 3, 4');
	await expect(page.getByRole('button', { name: 'stop simulation' })).toBeDisabled();

	const probe = await waitForWorkerProbe(page, (snapshot) =>
		snapshot.inbound.some((message) => message.type === 'complete'),
	);
	expect(probe.created).toBe(1);
	await selectElement(page, source);
	await connectedMode.check();
	await waitForDiagram(
		page,
		(saved) => saved?.elements[0]?.properties.enableObservableEvent === true,
	);
	const saved = await readPersistedDiagram(page);
	expect(saved?.elements[0].properties).toEqual(fromOperatorDefinition.defaults);
	await page.reload();
	await selectElement(page, source);
	await expect(page.getByRole('checkbox', { name: 'Observable event' })).toBeChecked();
});

test('Timer keeps numeric mode choices, restores relative due time and runs its one-shot default', async ({
	page,
}) => {
	const diagram = sourceFixture(ElementType.Timer, { ...timerOperatorDefinition.defaults });
	const source = diagram.elements[0];
	await bootstrapEditorWithDiagram(page, diagram);
	await selectElement(page, source);
	await expect(page.getByLabel('Due milliseconds', { exact: true })).toHaveValue('1000');
	await expect(page.getByLabel('Interval duration', { exact: true })).toHaveValue('-1');
	await page.getByRole('combobox', { name: 'Due date type' }).click();
	await page.getByRole('option', { name: 'Date', exact: true }).click();
	const dated = await waitForDiagram(
		page,
		(saved) => saved?.elements[0]?.properties.dueDateType === DueDateType.Date,
	);
	expect(dated.elements[0].properties.startDue).toMatchObject({
		kind: 'literal',
		type: 'date',
		value: expect.any(Number),
	});

	await page.getByRole('combobox', { name: 'Due date type' }).click();
	await page.getByRole('option', { name: 'Milliseconds', exact: true }).click();
	await expect(page.getByLabel('Due milliseconds', { exact: true })).toHaveValue('1000');
	await page.getByLabel('Due milliseconds', { exact: true }).fill('20');
	await waitForDiagram(
		page,
		(saved) => (saved?.elements[0]?.properties.startDue as { value?: number })?.value === 20,
	);
	await selectEntryOperator(page, source);
	await startSimulation(page);
	await expect(simulationResults(page)).toHaveText('0');
	await expect(page.getByRole('button', { name: 'stop simulation' })).toBeDisabled();
});
