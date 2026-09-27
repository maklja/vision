import { expect, test } from '@playwright/test';
import { ElementType } from '@maklja/vision-simulator-model';
import {
	addOperator,
	bootstrapEditor,
	connectOperators,
	selectEntryOperator,
	simulationResults,
	startSimulation,
} from './support/editor';
import { waitForDiagramCounts } from './support/indexedDb';
import { installWorkerProbe, waitForWorkerProbe } from './support/workerProbe';

test('builds and runs an of → map → filter → subscriber pipeline', async ({ page }) => {
	await installWorkerProbe(page);
	await bootstrapEditor(page);

	const source = await addOperator(page, 'creation operators', ElementType.Of, {
		x: 390,
		y: 300,
	});
	await waitForDiagramCounts(page, 1, 0);
	const map = await addOperator(page, 'transformation operators', ElementType.Map, {
		x: 545,
		y: 300,
	});
	await waitForDiagramCounts(page, 2, 0);
	const filter = await addOperator(page, 'filtering operators', ElementType.Filter, {
		x: 700,
		y: 300,
	});
	await waitForDiagramCounts(page, 3, 0);
	const subscriber = await addOperator(page, 'subscriber', ElementType.Subscriber, {
		x: 855,
		y: 300,
	});
	await waitForDiagramCounts(page, 4, 0);

	await connectOperators(page, source, map);
	await waitForDiagramCounts(page, 4, 1);
	await connectOperators(page, map, filter);
	await waitForDiagramCounts(page, 4, 2);
	await connectOperators(page, filter, subscriber);
	await waitForDiagramCounts(page, 4, 3);

	await selectEntryOperator(page, source);
	await startSimulation(page);

	await expect(simulationResults(page)).toHaveText('1, 2, 3, 4');

	const probe = await waitForWorkerProbe(page, (snapshot) =>
		snapshot.inbound.some((message) => message.type === 'complete'),
	);
	expect(probe.created).toBe(1);
	expect(probe.terminated).toBe(1);
	expect(probe.outbound.map((message) => message.type)).toEqual([
		'startSimulation',
		'stopSimulation',
	]);

	const subscriberValues = probe.inbound
		.filter((message) => message.type === 'next')
		.map((message) => message.value as { targetElementId?: string; value?: string })
		.filter((value) => value.targetElementId === subscriber.id)
		.map((value) => value.value);
	expect(subscriberValues).toEqual(['1', '2', '3', '4']);
});
