import { expect, test } from '@playwright/test';
import {
	ConnectPointPosition,
	ConnectPointType,
	deferOperatorDefinition,
	ElementType,
	FlowValueType,
	iifOperatorDefinition,
	ofOperatorDefinition,
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
	{
		name: 'iif true',
		definition: iifOperatorDefinition,
		condition: true,
		expected: ['1', '2', '3', '4'],
	},
	{
		name: 'iif false',
		definition: iifOperatorDefinition,
		condition: false,
		expected: ['90', '91'],
	},
	{
		name: 'defer',
		definition: deferOperatorDefinition,
		condition: true,
		expected: ['1', '2', '3', '4'],
	},
]) {
	test(`${scenario.name} preserves authored callbacks and runs only its selected reference`, async ({
		page,
	}) => {
		await installWorkerProbe(page);
		const conditional = scenario.definition.type === ElementType.IIf;
		const properties = conditional
			? {
					...iifOperatorDefinition.defaults,
					conditionExpression: `function condition() { return ${scenario.condition}; }`,
					...(scenario.condition
						? {
								falseCallbackExpression:
									'function falseResult() { throw new Error("unchosen branch"); }',
							}
						: {
								trueCallbackExpression:
									'function trueResult() { throw new Error("unchosen branch"); }',
							}),
				}
			: { ...deferOperatorDefinition.defaults };
		const diagram = createDiagram(
			[
				{
					id: 'entry',
					type: scenario.definition.type,
					name: 'entry',
					x: 440,
					y: 260,
					properties,
				},
				{ id: 'main-sink', type: ElementType.Subscriber, name: 'main', x: 700, y: 260 },
				{
					id: 'top',
					type: ElementType.Of,
					name: 'top',
					x: 160,
					y: 100,
					properties: { ...ofOperatorDefinition.defaults },
				},
				{ id: 'top-sink', type: ElementType.Subscriber, name: 'top sink', x: 440, y: 100 },
				...(conditional
					? [
							{
								id: 'bottom',
								type: ElementType.Range,
								name: 'bottom',
								x: 160,
								y: 440,
								properties: { start: 90, count: 2 },
							},
							{
								id: 'bottom-sink',
								type: ElementType.Subscriber,
								name: 'bottom sink',
								x: 440,
								y: 440,
							},
						]
					: []),
			],
			[
				{ id: 'main-output', sourceId: 'entry', targetId: 'main-sink' },
				{
					id: 'top-reference',
					sourceId: 'entry',
					targetId: 'top',
					sourceType: ConnectPointType.Event,
					sourcePosition: ConnectPointPosition.Top,
				},
				{ id: 'top-output', sourceId: 'top', targetId: 'top-sink' },
				...(conditional
					? [
							{
								id: 'bottom-reference',
								sourceId: 'entry',
								targetId: 'bottom',
								sourceType: ConnectPointType.Event,
								sourcePosition: ConnectPointPosition.Bottom,
							},
							{ id: 'bottom-output', sourceId: 'bottom', targetId: 'bottom-sink' },
						]
					: []),
			],
		);
		await bootstrapEditorWithDiagram(page, diagram);
		const entry = fixtureElement(diagram, 'entry');
		await selectElement(page, entry);
		for (const field of Object.values(scenario.definition.properties)) {
			await expect(page.getByText(field.label, { exact: true })).toBeVisible();
		}
		await selectEntryOperator(page, entry);
		await startSimulation(page);
		const probe = await waitForWorkerProbe(page, (snapshot) =>
			snapshot.inbound.some((message) => message.type === 'complete'),
		);
		expect(probe.created).toBe(1);
		const values = probe.inbound
			.filter((message) => message.type === 'next')
			.map(
				(message) =>
					message.value as {
						type: FlowValueType;
						value: string;
						sourceElementId: string;
						targetElementId: string;
					},
			)
			.filter((event) => event.type === FlowValueType.Next);
		expect(
			values
				.filter((event) => event.targetElementId === 'main-sink')
				.map((event) => event.value),
		).toEqual(scenario.expected);
		if (conditional) {
			const unchosen = scenario.condition ? 'bottom' : 'top';
			expect(values.filter((event) => event.sourceElementId === unchosen)).toEqual([]);
		}
		await expect(page.getByRole('button', { name: 'stop simulation' })).toBeDisabled();
		const saved = await readPersistedDiagram(page);
		expect(saved?.elements.find((element) => element.id === 'entry')?.properties).toEqual(
			properties,
		);
	});
}
