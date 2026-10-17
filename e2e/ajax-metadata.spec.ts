import { expect, test } from '@playwright/test';
import {
	ajaxOperatorDefinition,
	ElementType,
	FlowValueType,
	HttpMethod,
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

test('Ajax keeps request properties and sends the whole response through Map to Subscriber', async ({
	page,
	context,
}) => {
	const requests: {
		method: string;
		body: unknown;
		header: string | undefined;
		tag: string | null;
	}[] = [];
	await context.route('**/vision/__metadata_ajax**', async (route) => {
		const request = route.request();
		requests.push({
			method: request.method(),
			body: request.postDataJSON(),
			header: request.headers()['x-test'],
			tag: new URL(request.url()).searchParams.get('tag'),
		});
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: '{"answer":42}',
		});
	});
	await installWorkerProbe(page);
	const properties = {
		...ajaxOperatorDefinition.defaults,
		url: '/vision/__metadata_ajax',
		method: HttpMethod.Post,
		body: '{"question":1}',
		headers: [
			['X-Test', 'first'],
			['X-Test', 'last'],
		],
		queryParams: [
			['tag', 'a'],
			['tag', 'b'],
		],
		responseType: 'json',
		timeout: 5000,
	};
	const diagram = createDiagram(
		[
			{ id: 'entry', type: ElementType.Ajax, name: 'ajax', x: 180, y: 280, properties },
			{
				id: 'map',
				type: ElementType.Map,
				name: 'map',
				x: 440,
				y: 280,
				properties: {
					projectExpression:
						'function project(response) { return response.status + ":" + response.response.answer; }',
				},
			},
			{ id: 'sink', type: ElementType.Subscriber, name: 'sink', x: 740, y: 280 },
		],
		[
			{ id: 'input', sourceId: 'entry', targetId: 'map' },
			{ id: 'output', sourceId: 'map', targetId: 'sink' },
		],
	);
	await bootstrapEditorWithDiagram(page, diagram);
	const entry = fixtureElement(diagram, 'entry');
	await selectElement(page, entry);
	await expect(page.getByRole('textbox', { name: 'Url', exact: true })).toHaveValue(
		properties.url,
	);
	expect(requests).toEqual([]);
	await selectEntryOperator(page, entry);
	await startSimulation(page);
	const probe = await waitForWorkerProbe(page, (snapshot) =>
		snapshot.inbound.some((message) => message.type === 'complete'),
	);
	const values = probe.inbound
		.filter((message) => message.type === 'next')
		.map(
			(message) =>
				message.value as { type: FlowValueType; targetElementId: string; value: string },
		);
	expect(
		values
			.filter(
				(value) => value.type === FlowValueType.Next && value.targetElementId === 'sink',
			)
			.map((value) => value.value),
	).toEqual(['200:42']);
	expect(requests).toEqual([
		{ method: 'POST', body: { question: 1 }, header: 'last', tag: 'a,b' },
	]);
	await expect(page.getByRole('button', { name: 'stop simulation' })).toBeDisabled();
	expect(
		(await readPersistedDiagram(page))?.elements.find((element) => element.id === 'entry')
			?.properties,
	).toEqual(properties);
	await page.reload();
	await selectElement(page, entry);
	await expect(page.getByRole('textbox', { name: 'Url', exact: true })).toHaveValue(
		properties.url,
	);
	expect(
		(await readPersistedDiagram(page))?.elements.find((element) => element.id === 'entry')
			?.properties,
	).toEqual(properties);
	expect(requests).toHaveLength(1);
});
