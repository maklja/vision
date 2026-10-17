import { expect, test } from '@playwright/test';
import {
	ConnectPointPosition,
	ConnectPointType,
	ElementType,
	FlowValueType,
	filterOperatorDefinition,
	catchErrorOperatorDefinition,
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

for (const recover of [false, true]) {
	test(
		recover
			? 'Filter errors recover through the configured CatchError reference in the Worker'
			: 'Filter keeps its no-form behavior and filters saved predicates in the Worker',
		async ({ page }) => {
			await installWorkerProbe(page);
			const predicateExpression = recover
				? 'function predicate(value, index) { if (index !== 0) throw new Error("index"); if (value === 2) throw new Error("boom"); return true; }'
				: 'function predicate(value, index) { return index === 0 && value % 2 === 0; }';
			const selectorExpression =
				'function selector(err, caught) { if (err.message !== "boom" || typeof caught.subscribe !== "function") throw new Error("selector arguments"); return createObservable({start:10,count:2}); }';
			const diagram = createDiagram(
				[
					{
						id: 'entry',
						type: ElementType.Of,
						name: 'entry',
						x: 80,
						y: 280,
						properties: {
							argsFactoryExpression: 'function argsFactory() { return [1,2,3,4]; }',
						},
					},
					{
						id: 'filter',
						type: ElementType.Filter,
						name: 'filter',
						x: 280,
						y: 280,
						properties: { ...filterOperatorDefinition.defaults, predicateExpression },
					},
					{ id: 'sink', type: ElementType.Subscriber, name: 'sink', x: 800, y: 280 },
					...(recover
						? [
								{
									id: 'catch',
									type: ElementType.CatchError,
									name: 'catch',
									x: 520,
									y: 280,
									properties: {
										...catchErrorOperatorDefinition.defaults,
										selectorExpression,
									},
								},
								{
									id: 'recovery',
									type: ElementType.Range,
									name: 'recovery',
									x: 280,
									y: 100,
									properties: { start: 99, count: 99 },
								},
								{
									id: 'recovery-sink',
									type: ElementType.Subscriber,
									name: 'recovery sink',
									x: 600,
									y: 100,
								},
							]
						: []),
				],
				[
					{ id: 'input', sourceId: 'entry', targetId: 'filter' },
					{ id: 'output', sourceId: recover ? 'catch' : 'filter', targetId: 'sink' },
					...(recover
						? [
								{ id: 'filter-catch', sourceId: 'filter', targetId: 'catch' },
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
			await selectElement(page, fixtureElement(diagram, 'filter'));
			await expect(
				page.getByText(filterOperatorDefinition.properties.predicateExpression.label, {
					exact: true,
				}),
			).toHaveCount(0);
			if (recover) {
				await selectElement(page, fixtureElement(diagram, 'catch'));
				await expect(
					page.getByText(
						catchErrorOperatorDefinition.properties.selectorExpression.label,
						{ exact: true },
					),
				).toBeVisible();
			}
			await selectEntryOperator(page, fixtureElement(diagram, 'entry'));
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
			).toEqual(recover ? ['1', '10', '11'] : ['2', '4']);
			if (recover)
				expect(events.filter((event) => event.type === FlowValueType.Error)).toEqual([
					expect.objectContaining({
						sourceElementId: 'filter',
						targetElementId: 'catch',
						value: 'Error: boom',
					}),
				]);
			await expect(page.getByRole('button', { name: 'stop simulation' })).toBeDisabled();
			const saved = await readPersistedDiagram(page);
			expect(saved?.elements.find((element) => element.id === 'filter')?.properties).toEqual({
				predicateExpression,
			});
			if (recover)
				expect(
					saved?.elements.find((element) => element.id === 'catch')?.properties,
				).toEqual({ selectorExpression });
			await page.reload();
			await selectElement(page, fixtureElement(diagram, 'filter'));
			await expect(
				page.getByText(filterOperatorDefinition.properties.predicateExpression.label, {
					exact: true,
				}),
			).toHaveCount(0);
			const restored = await readPersistedDiagram(page);
			expect(
				restored?.elements.find((element) => element.id === 'filter')?.properties,
			).toEqual({ predicateExpression });
			if (recover)
				expect(
					restored?.elements.find((element) => element.id === 'catch')?.properties,
				).toEqual({ selectorExpression });
		},
	);
}
