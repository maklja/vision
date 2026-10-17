import { expect, test } from '@playwright/test';
import {
	ConnectPointPosition,
	ConnectPointType,
	ElementType,
	FlowValueType,
	ObservableInputsType,
	combineLatestOperatorDefinition,
	concatOperatorDefinition,
	forkJoinOperatorDefinition,
	raceOperatorDefinition,
	zipOperatorDefinition,
} from '@maklja/vision-simulator-model';
import {
	bootstrapEditorWithDiagram,
	selectElement,
	selectEntryOperator,
	startSimulation,
} from './support/editor';
import { createDiagram, fixtureElement } from './support/fixtures';
import { readPersistedDiagram, waitForDiagram } from './support/indexedDb';
import { installWorkerProbe, waitForWorkerProbe } from './support/workerProbe';

for (const definition of [
	combineLatestOperatorDefinition,
	concatOperatorDefinition,
	forkJoinOperatorDefinition,
	raceOperatorDefinition,
	zipOperatorDefinition,
]) {
	for (const mode of 'observableInputsType' in definition.properties
		? [ObservableInputsType.Array, ObservableInputsType.Object]
		: [ObservableInputsType.Array]) {
		test(`${definition.name} preserves reference order and ${mode} inputs through Worker execution and reload`, async ({
			page,
		}) => {
			await installWorkerProbe(page);
			const diagram = createDiagram(
				[
					{
						id: 'join',
						type: definition.type,
						name: definition.name,
						x: 430,
						y: 280,
						properties: { ...definition.defaults },
					},
					{ id: 'sink', type: ElementType.Subscriber, name: 'sink', x: 750, y: 280 },
					{
						id: 'of',
						type: ElementType.Of,
						name: 'values',
						x: 160,
						y: 100,
						properties: {
							argsFactoryExpression: 'function argsFactory() { return [1,2]; }',
						},
					},
					{
						id: 'of-sink',
						type: ElementType.Subscriber,
						name: 'values sink',
						x: 460,
						y: 100,
					},
					{
						id: 'range',
						type: ElementType.Range,
						name: 'range',
						x: 160,
						y: 440,
						properties: { start: 10, count: 2 },
					},
					{
						id: 'range-sink',
						type: ElementType.Subscriber,
						name: 'range sink',
						x: 460,
						y: 440,
					},
				],
				[
					{ id: 'output', sourceId: 'join', targetId: 'sink' },
					{
						id: 'of-reference',
						sourceId: 'join',
						targetId: 'of',
						sourceType: ConnectPointType.Event,
						sourcePosition: ConnectPointPosition.Top,
						index: 2,
					},
					{
						id: 'range-reference',
						sourceId: 'join',
						targetId: 'range',
						sourceType: ConnectPointType.Event,
						sourcePosition: ConnectPointPosition.Bottom,
						index: 1,
					},
					{ id: 'of-output', sourceId: 'of', targetId: 'of-sink' },
					{ id: 'range-output', sourceId: 'range', targetId: 'range-sink' },
				],
			);
			await bootstrapEditorWithDiagram(page, diagram);
			const join = fixtureElement(diagram, 'join');
			await selectElement(page, join);
			if ('observableInputsType' in definition.properties) {
				const field = definition.properties.observableInputsType;
				const select = page.getByRole('combobox', { name: field.label });
				await expect(select).toHaveText('Array');
				if (mode === ObservableInputsType.Object) {
					await select.click();
					await page.getByRole('option', { name: 'Object', exact: true }).click();
					await page.getByLabel('Key', { exact: true }).nth(0).fill('first');
					await page.getByLabel('Key', { exact: true }).nth(1).fill('second');
					await waitForDiagram(
						page,
						(current) =>
							current?.elements.find((element) => element.id === 'join')?.properties
								.observableInputsType === mode &&
							current.connectLines.some((line) => line.name === 'first') &&
							current.connectLines.some((line) => line.name === 'second'),
					);
				}
			} else
				await expect(
					page.getByText('Observable inputs order', { exact: true }),
				).toBeVisible();
			await selectEntryOperator(page, join);
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
					(event) =>
						event.type === FlowValueType.Next && event.targetElementId === 'sink',
				)
				.map((event) => event.value);
			const expected =
				definition === concatOperatorDefinition
					? ['10', '11', '1', '2']
					: definition === raceOperatorDefinition
						? ['10', '11']
						: definition === forkJoinOperatorDefinition
							? ['11,2']
							: definition === zipOperatorDefinition
								? ['10,1', '11,2']
								: ['11,1', '11,2'];
			expect(values).toEqual(
				mode === ObservableInputsType.Object
					? expected.map(() => '[object Object]')
					: expected,
			);
			await expect(page.getByRole('button', { name: 'stop simulation' })).toBeDisabled();
			const saved = await readPersistedDiagram(page);
			expect(saved?.elements.find((element) => element.id === 'join')?.properties).toEqual(
				'observableInputsType' in definition.properties
					? { observableInputsType: mode }
					: {},
			);
			expect(saved?.connectLines.find((line) => line.id === 'of-reference')?.index).toBe(2);
			expect(saved?.connectLines.find((line) => line.id === 'range-reference')?.index).toBe(
				1,
			);
			await page.reload();
			await selectElement(page, join);
			if ('observableInputsType' in definition.properties)
				await expect(
					page.getByRole('combobox', {
						name: definition.properties.observableInputsType.label,
					}),
				).toHaveText(mode === ObservableInputsType.Array ? 'Array' : 'Object');
			if (mode === ObservableInputsType.Object) {
				const restored = await readPersistedDiagram(page);
				expect(
					restored?.connectLines
						.filter((line) => line.source.connectPointType === ConnectPointType.Event)
						.map((line) => line.name)
						.sort(),
				).toEqual(['first', 'second']);
			}
		});
	}
}
