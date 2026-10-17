import { expect, test } from '@playwright/test';
import {
	ConnectPointPosition,
	ConnectPointType,
	ElementType,
	FlowValueType,
	emptyOperatorDefinition,
	generateOperatorDefinition,
	throwErrorOperatorDefinition,
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

for (const scenario of [
	{ name: 'empty', definition: emptyOperatorDefinition, expression: undefined, expected: [] },
	{
		name: 'generate',
		definition: generateOperatorDefinition,
		expression: undefined,
		expected: ['0', '1000', '2000'],
	},
	{
		name: 'throwError factory',
		definition: throwErrorOperatorDefinition,
		expression: 'function factory() { return new Error("browser failure"); }',
		expected: ['7', '8'],
	},
	{
		name: 'throwError value',
		definition: throwErrorOperatorDefinition,
		expression: 'new Error("browser failure")',
		expected: ['7', '8'],
	},
]) {
	test(`${scenario.name} preserves properties and runs in the Worker`, async ({ page }) => {
		await installWorkerProbe(page);
		const recover = scenario.definition === throwErrorOperatorDefinition;
		const properties = {
			...scenario.definition.defaults,
			...(scenario.expression ? { errorOrErrorFactory: scenario.expression } : {}),
		};
		const diagram = createDiagram(
			[
				{
					id: 'entry',
					type: scenario.definition.type,
					name: scenario.name,
					x: 180,
					y: 280,
					properties,
				},
				{ id: 'sink', type: ElementType.Subscriber, name: 'sink', x: 740, y: 280 },
				...(recover
					? [
							{
								id: 'catch',
								type: ElementType.CatchError,
								name: 'catch',
								x: 440,
								y: 280,
								properties: {
									selectorExpression:
										'function selector(err) { if (err.message !== "browser failure") throw new Error("raw error"); return createObservable({start:7,count:2}); }',
								},
							},
							{
								id: 'recovery',
								type: ElementType.Range,
								name: 'recovery',
								x: 180,
								y: 100,
								properties: { start: 99, count: 99 },
							},
							{
								id: 'recovery-sink',
								type: ElementType.Subscriber,
								name: 'recovery sink',
								x: 520,
								y: 100,
							},
						]
					: []),
			],
			[
				{ id: 'output', sourceId: recover ? 'catch' : 'entry', targetId: 'sink' },
				...(recover
					? [
							{ id: 'error-input', sourceId: 'entry', targetId: 'catch' },
							{
								id: 'reference',
								sourceId: 'catch',
								targetId: 'recovery',
								sourceType: ConnectPointType.Event,
								sourcePosition: ConnectPointPosition.Top,
							},
							{
								id: 'recovery-output',
								sourceId: 'recovery',
								targetId: 'recovery-sink',
							},
						]
					: []),
			],
		);
		await bootstrapEditorWithDiagram(page, diagram);
		const entry = fixtureElement(diagram, 'entry');
		await selectElement(page, entry);
		for (const field of Object.values(scenario.definition.properties)) {
			const label = page.getByText(field.label, { exact: true });
			await label.scrollIntoViewIfNeeded();
			await expect(label).toBeVisible();
		}
		await selectEntryOperator(page, entry);
		await startSimulation(page);
		const probe = await waitForWorkerProbe(page, (snapshot) =>
			snapshot.inbound.some((message) => message.type === 'complete'),
		);
		const events = probe.inbound
			.filter((message) => message.type === 'next')
			.map(
				(message) =>
					message.value as {
						type: FlowValueType;
						targetElementId: string;
						sourceElementId: string;
						value: string;
					},
			);
		expect(
			events
				.filter(
					(event) =>
						event.type === FlowValueType.Next && event.targetElementId === 'sink',
				)
				.map((event) => event.value),
		).toEqual(scenario.expected);
		if (recover)
			expect(events.filter((event) => event.type === FlowValueType.Error)).toEqual([
				expect.objectContaining({
					sourceElementId: 'entry',
					targetElementId: 'catch',
					value: 'Error: browser failure',
				}),
			]);
		await expect(page.getByRole('button', { name: 'stop simulation' })).toBeDisabled();
		const saved = await readPersistedDiagram(page);
		expect(saved?.elements.find((element) => element.id === 'entry')?.properties).toEqual(
			properties,
		);
		await page.reload();
		await selectElement(page, entry);
		const restored = await readPersistedDiagram(page);
		expect(restored?.elements.find((element) => element.id === 'entry')?.properties).toEqual(
			properties,
		);
	});
}
