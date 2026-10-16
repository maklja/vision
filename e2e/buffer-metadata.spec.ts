import { expect, test } from '@playwright/test';
import {
	ConnectPointPosition,
	ConnectPointType,
	ElementType,
	FlowValueType,
	bufferOperatorDefinition,
	bufferCountOperatorDefinition,
	bufferTimeOperatorDefinition,
	bufferToggleOperatorDefinition,
	bufferWhenOperatorDefinition,
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
	bufferOperatorDefinition,
	bufferCountOperatorDefinition,
	bufferTimeOperatorDefinition,
	bufferToggleOperatorDefinition,
	bufferWhenOperatorDefinition,
]) {
	test(`${definition.name} preserves its properties and runs in the Worker`, async ({ page }) => {
		await installWorkerProbe(page);
		const notifier = definition.referencePorts.length > 0;
		const toggle = definition.type === ElementType.BufferToggle;
		const properties = { ...definition.defaults };
		const diagram = createDiagram(
			[
				{
					id: 'entry',
					type: ElementType.Of,
					name: 'entry',
					x: 100,
					y: 280,
					properties: {
						argsFactoryExpression: 'function argsFactory() { return [1,2,3,4]; }',
					},
				},
				{
					id: 'buffer',
					type: definition.type,
					name: definition.name,
					x: 400,
					y: 280,
					properties,
				},
				{ id: 'sink', type: ElementType.Subscriber, name: 'sink', x: 700, y: 280 },
				...(notifier
					? [
							{
								id: 'notifier',
								type: toggle ? ElementType.Of : ElementType.Timer,
								name: 'notifier',
								x: 180,
								y: 100,
								properties: toggle
									? {
											argsFactoryExpression:
												'function argsFactory() { return [100]; }',
										}
									: { dueDateType: 0, startDue: 1000, intervalDuration: -1 },
							},
							{
								id: 'notifier-sink',
								type: ElementType.Subscriber,
								name: 'notifier sink',
								x: 500,
								y: 100,
							},
						]
					: []),
				...(toggle
					? [
							{
								id: 'closing',
								type: ElementType.Timer,
								name: 'closing',
								x: 180,
								y: 440,
								properties: {
									dueDateType: 0,
									startDue: 1000,
									intervalDuration: -1,
								},
							},
							{
								id: 'closing-sink',
								type: ElementType.Subscriber,
								name: 'closing sink',
								x: 500,
								y: 440,
							},
						]
					: []),
			],
			[
				{ id: 'input', sourceId: 'entry', targetId: 'buffer' },
				{ id: 'output', sourceId: 'buffer', targetId: 'sink' },
				...(notifier
					? [
							{
								id: 'reference',
								sourceId: 'buffer',
								targetId: 'notifier',
								sourceType: ConnectPointType.Event,
								sourcePosition: ConnectPointPosition.Top,
							},
							{
								id: 'notifier-output',
								sourceId: 'notifier',
								targetId: 'notifier-sink',
							},
						]
					: []),
				...(toggle
					? [
							{
								id: 'closing-reference',
								sourceId: 'buffer',
								targetId: 'closing',
								sourceType: ConnectPointType.Event,
								sourcePosition: ConnectPointPosition.Bottom,
							},
							{ id: 'closing-output', sourceId: 'closing', targetId: 'closing-sink' },
						]
					: []),
			],
		);
		await bootstrapEditorWithDiagram(page, diagram);
		await selectElement(page, fixtureElement(diagram, 'buffer'));
		for (const field of Object.values(definition.properties)) {
			if (field.kind === 'number')
				await expect(page.getByLabel(field.label, { exact: true })).toBeVisible();
			else await expect(page.getByText(field.label, { exact: true })).toBeVisible();
		}
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
		expect(values).toEqual(
			definition === bufferCountOperatorDefinition ? ['1,2,3', '3,4'] : ['1,2,3,4'],
		);
		await expect(page.getByRole('button', { name: 'stop simulation' })).toBeDisabled();
		const saved = await readPersistedDiagram(page);
		expect(saved?.elements.find((element) => element.id === 'buffer')?.properties).toEqual(
			properties,
		);
		await page.reload();
		await selectElement(page, fixtureElement(diagram, 'buffer'));
	});
}
