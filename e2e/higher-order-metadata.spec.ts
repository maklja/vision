import { expect, test } from '@playwright/test';
import {
	ConnectPointPosition,
	ConnectPointType,
	ElementType,
	FlowValueType,
	concatMapOperatorDefinition,
	exhaustMapOperatorDefinition,
	expandOperatorDefinition,
	mergeMapOperatorDefinition,
} from '@maklja/vision-simulator-model';
import {
	bootstrapEditorWithDiagram,
	selectElement,
	selectEntryOperator,
	startSimulation,
} from './support/editor';
import { createDiagram, fixtureElement } from './support/fixtures';
import { readPersistedDiagram } from './support/indexedDb';
import { installWorkerProbe, waitForWorkerProbe } from './support/workerProbe';

for (const definition of [
	concatMapOperatorDefinition,
	exhaustMapOperatorDefinition,
	expandOperatorDefinition,
	mergeMapOperatorDefinition,
]) {
	test(`${definition.name} preserves project properties and runs its connected reference in the Worker`, async ({
		page,
	}) => {
		await installWorkerProbe(page);
		const properties = {
			...definition.defaults,
			projectExpression:
				'function project(value, index) { return value < 3 ? createObservable({ start: value + 1, count: 1 }) : []; }',
		};
		const diagram = createDiagram(
			[
				{
					id: 'entry',
					type: ElementType.Of,
					name: 'entry',
					x: 120,
					y: 280,
					properties: { argsFactoryExpression: 'function argsFactory() { return [1]; }' },
				},
				{
					id: 'operator',
					type: definition.type,
					name: definition.name,
					x: 400,
					y: 280,
					properties,
				},
				{ id: 'sink', type: ElementType.Subscriber, name: 'sink', x: 700, y: 280 },
				{
					id: 'child',
					type: ElementType.Range,
					name: 'child',
					x: 200,
					y: 100,
					properties: { start: 99, count: 1 },
				},
				{
					id: 'child-sink',
					type: ElementType.Subscriber,
					name: 'child sink',
					x: 500,
					y: 100,
				},
			],
			[
				{ id: 'input', sourceId: 'entry', targetId: 'operator' },
				{ id: 'output', sourceId: 'operator', targetId: 'sink' },
				{
					id: 'reference',
					sourceId: 'operator',
					targetId: 'child',
					sourceType: ConnectPointType.Event,
					sourcePosition: ConnectPointPosition.Top,
				},
				{ id: 'child-output', sourceId: 'child', targetId: 'child-sink' },
			],
		);
		await bootstrapEditorWithDiagram(page, diagram);
		await selectElement(page, fixtureElement(diagram, 'operator'));
		await expect(page.getByText('Project', { exact: true })).toBeVisible();
		if ('concurrent' in definition.properties)
			await expect(page.getByLabel('Concurrent', { exact: true })).toBeVisible();
		await selectEntryOperator(page, fixtureElement(diagram, 'entry'));
		await startSimulation(page);
		const probe = await waitForWorkerProbe(page, (snapshot) =>
			snapshot.inbound.some((message) => message.type === 'complete'),
		);
		const values = probe.inbound
			.filter((message) => message.type === 'next')
			.map(
				(message) =>
					message.value as {
						type: FlowValueType;
						targetElementId: string;
						value: string;
					},
			)
			.filter(
				(event) => event.type === FlowValueType.Next && event.targetElementId === 'sink',
			)
			.map((event) => event.value);
		expect(values).toEqual(definition === expandOperatorDefinition ? ['1', '2', '3'] : ['2']);
		await expect(page.getByRole('button', { name: 'stop simulation' })).toBeDisabled();
		const saved = await readPersistedDiagram(page);
		expect(saved?.elements.find((element) => element.id === 'operator')?.properties).toEqual(
			properties,
		);
		await page.reload();
		await selectElement(page, fixtureElement(diagram, 'operator'));
		await expect(page.getByText('Project', { exact: true })).toBeVisible();
	});
}
