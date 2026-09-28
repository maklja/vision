import { expect, test } from '@playwright/test';
import {
	bootstrapEditorWithDiagram,
	selectEntryOperator,
	simulationResults,
	startSimulation,
} from './support/editor';
import { fixtureElement, infiniteSourceFixture } from './support/fixtures';
import {
	installWorkerProbe,
	readWorkerProbe,
	WorkerProbeSnapshot,
	waitForWorkerProbe,
} from './support/workerProbe';

/** The fixture's `interval` period. The observation window must cover at least three of them. */
const INTERVAL_PERIOD_MS = 25;
const OBSERVATION_MS = INTERVAL_PERIOD_MS * 6;

interface FlowValueEventPayload {
	value: string;
	targetElementId: string;
}

/** Ordered `next` values delivered to the subscriber by the probed simulation worker. */
function subscriberValues(probe: WorkerProbeSnapshot, subscriberId: string): string[] {
	return probe.inbound
		.filter((message) => message.type === 'next')
		.map((message) => message.value as FlowValueEventPayload)
		.filter((event) => event.targetElementId === subscriberId)
		.map((event) => event.value);
}

test('stops an infinite interval source and restarts it in a fresh worker', async ({ page }) => {
	const consoleErrors: string[] = [];
	const pageErrors: string[] = [];
	page.on('console', (message) => {
		if (message.type() === 'error') {
			consoleErrors.push(message.text());
		}
	});
	page.on('pageerror', (error) => pageErrors.push(error.message));

	await installWorkerProbe(page);
	await bootstrapEditorWithDiagram(page, infiniteSourceFixture);

	const interval = fixtureElement(infiniteSourceFixture, 'interval');
	const subscriber = fixtureElement(infiniteSourceFixture, 'interval-subscriber');
	const palette = page.getByRole('button', { name: 'creation operators', exact: true });

	// First run: the time-based source emits a strictly ordered value sequence.
	await selectEntryOperator(page, interval);
	await startSimulation(page);
	await expect(palette).toBeDisabled();

	const running = await waitForWorkerProbe(
		page,
		(snapshot) => subscriberValues(snapshot, subscriber.id).length >= 3,
	);
	expect(running.created).toBe(1);
	const firstRunValues = subscriberValues(running, subscriber.id);
	expect(firstRunValues.slice(0, 3)).toEqual(['0', '1', '2']);
	expect(firstRunValues).toEqual(firstRunValues.map((_value, index) => String(index)));

	// Stop the real time-based source.
	await page.getByRole('button', { name: 'stop simulation' }).click();

	const stopped = await waitForWorkerProbe(page, (snapshot) =>
		snapshot.outbound.some((message) => message.type === 'stopSimulation'),
	);
	expect(stopped.outbound.map((message) => message.type)).toEqual([
		'startSimulation',
		'stopSimulation',
	]);
	expect(stopped.terminated).toBe(1);

	// Visible simulation state is cleared and the editor is usable again.
	await expect(simulationResults(page)).toHaveText('');
	await expect(page.getByRole('button', { name: 'reset simulation' })).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'stop simulation' })).toBeDisabled();
	await expect(palette).toBeEnabled();

	// No further worker events arrive over an observation window longer than three periods. One
	// period settles messages already in flight from before the worker was terminated.
	await page.waitForTimeout(INTERVAL_PERIOD_MS);
	const baseline = await readWorkerProbe(page);
	await page.waitForTimeout(OBSERVATION_MS);
	const observed = await readWorkerProbe(page);
	expect(observed.inbound.length).toBe(baseline.inbound.length);
	expect(observed.outbound.length).toBe(baseline.outbound.length);
	expect(observed.terminated).toBe(baseline.terminated);

	// Restart: a fresh worker emits a fresh subscription starting from 0, with no stale events.
	const firstRunCount = subscriberValues(baseline, subscriber.id).length;
	await startSimulation(page);

	const restarted = await waitForWorkerProbe(
		page,
		(snapshot) => subscriberValues(snapshot, subscriber.id).length >= firstRunCount + 3,
	);
	expect(restarted.created).toBe(2);
	const restartedValues = subscriberValues(restarted, subscriber.id);
	expect(restartedValues.slice(firstRunCount, firstRunCount + 3)).toEqual(['0', '1', '2']);

	// The second worker is torn down independently.
	await page.getByRole('button', { name: 'stop simulation' }).click();
	const afterSecondStop = await waitForWorkerProbe(page, (snapshot) => snapshot.terminated >= 2);
	expect(afterSecondStop.terminated).toBe(2);
	expect(afterSecondStop.outbound.map((message) => message.type)).toEqual([
		'startSimulation',
		'stopSimulation',
		'startSimulation',
		'stopSimulation',
	]);
	await expect(page.getByRole('button', { name: 'stop simulation' })).toBeDisabled();
	await expect(simulationResults(page)).toHaveText('');

	expect(pageErrors).toEqual([]);
	expect(consoleErrors).toEqual([]);
});
