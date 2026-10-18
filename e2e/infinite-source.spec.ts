import { expect, Page, test } from '@playwright/test';
import {
	bootstrapEditorWithDiagram,
	selectEntryOperator,
	simulationResults,
	startSimulation,
} from './support/editor';
import { fixtureElement, infiniteSourceFixture } from './support/fixtures';
import {
	waitForCanvasAnimationsToSettle,
	waitForRunningCanvasAnimations,
} from './support/canvasAnimations';
import { installWorkerProbe, WorkerProbeSnapshot, waitForWorkerProbe } from './support/workerProbe';

interface FlowValueEventPayload {
	value: string;
	targetElementId: string;
}

/** Ordered `next` values delivered to the subscriber by the probed simulation worker. */
function subscriberValues(
	probe: WorkerProbeSnapshot,
	subscriberId: string,
	workerId: number,
): string[] {
	return probe.inbound
		.filter((message) => message.workerId === workerId && message.type === 'next')
		.map((message) => message.value as FlowValueEventPayload)
		.filter((event) => event.targetElementId === subscriberId)
		.map((event) => event.value);
}

/**
 * Stops through the real control in the same browser task that observes the third subscriber value.
 * Keeping detection and the click together prevents a fast source from starving a later CDP input
 * event on constrained CI runners.
 */
async function stopAfterSubscriberValues(
	page: Page,
	subscriberId: string,
	workerId: number,
): Promise<WorkerProbeSnapshot> {
	await expect
		.poll(
			() =>
				page.evaluate(
					({ expectedSubscriberId, expectedWorkerId }) => {
						const probe = (
							window as unknown as {
								__visionWorkerProbe?: { snapshot: () => WorkerProbeSnapshot };
							}
						).__visionWorkerProbe;
						if (!probe) {
							throw new Error(
								'Worker probe is not installed; call installWorkerProbe first',
							);
						}

						const snapshot = probe.snapshot();
						const valueCount = snapshot.inbound.filter((message) => {
							if (message.workerId !== expectedWorkerId || message.type !== 'next') {
								return false;
							}

							const event = message.value as FlowValueEventPayload;
							return event.targetElementId === expectedSubscriberId;
						}).length;
						if (valueCount < 3) {
							return false;
						}

						const stopButton = document.querySelector<HTMLButtonElement>(
							'button[aria-label="stop simulation"]',
						);
						if (!stopButton) {
							throw new Error('Stop simulation control is unavailable');
						}

						stopButton.click();
						return true;
					},
					{ expectedSubscriberId: subscriberId, expectedWorkerId: workerId },
				),
			{ intervals: [0, 10, 25, 50, 100] },
		)
		.toBe(true);

	return waitForWorkerProbe(page, (snapshot) => snapshot.terminated >= workerId);
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

	const stopped = await stopAfterSubscriberValues(page, subscriber.id, 1);
	expect(stopped.created).toBe(1);
	const firstRunValues = subscriberValues(stopped, subscriber.id, 1);
	expect(firstRunValues.slice(0, 3)).toEqual(['0', '1', '2']);
	expect(firstRunValues).toEqual(firstRunValues.map((_value, index) => String(index)));

	expect(stopped.outbound.map((message) => message.type)).toEqual([
		'startSimulation',
		'stopSimulation',
	]);
	// A terminated worker cannot post new messages, so this is the deterministic cancellation proof.
	expect(stopped.terminated).toBe(1);

	// The rendered canvas stops animating as well; the animation registry drains instead of leaving
	// highlights or movement tweens behind.
	await waitForCanvasAnimationsToSettle(page);

	// Visible simulation state is cleared and the editor is usable again.
	await expect(simulationResults(page)).toHaveText('');
	await expect(page.getByRole('button', { name: 'reset simulation' })).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'stop simulation' })).toBeDisabled();
	await expect(palette).toBeEnabled();

	// Restart: generation-tagged probe messages distinguish the fresh worker from any first-run
	// message that was already queued when the old worker terminated.
	await startSimulation(page);

	const afterSecondStop = await stopAfterSubscriberValues(page, subscriber.id, 2);
	expect(afterSecondStop.created).toBe(2);
	expect(subscriberValues(afterSecondStop, subscriber.id, 2).slice(0, 3)).toEqual([
		'0',
		'1',
		'2',
	]);

	// The second worker is torn down independently.
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

test('restarts the infinite interval source with fresh canvas animations', async ({ page }) => {
	await installWorkerProbe(page);
	await bootstrapEditorWithDiagram(page, infiniteSourceFixture);

	const interval = fixtureElement(infiniteSourceFixture, 'interval');
	const subscriber = fixtureElement(infiniteSourceFixture, 'interval-subscriber');

	await selectEntryOperator(page, interval);
	await startSimulation(page);
	await stopAfterSubscriberValues(page, subscriber.id, 1);
	await waitForCanvasAnimationsToSettle(page);

	await startSimulation(page);
	const restarted = await waitForWorkerProbe(
		page,
		(snapshot) => subscriberValues(snapshot, subscriber.id, 2).length >= 3,
	);
	expect(subscriberValues(restarted, subscriber.id, 2).slice(0, 3)).toEqual(['0', '1', '2']);
	// The fresh subscription animates again instead of reusing the stopped run's animations.
	await waitForRunningCanvasAnimations(page);
});

test('keeps the editor responsive while a fast infinite source outruns its animations', async ({
	page,
}) => {
	await installWorkerProbe(page);
	await bootstrapEditorWithDiagram(page, infiniteSourceFixture);

	const interval = fixtureElement(infiniteSourceFixture, 'interval');
	const subscriber = fixtureElement(infiniteSourceFixture, 'interval-subscriber');

	await selectEntryOperator(page, interval);
	await startSimulation(page);
	const sustainedRun = await waitForWorkerProbe(
		page,
		(snapshot) => subscriberValues(snapshot, subscriber.id, 1).length >= 150,
	);
	expect(subscriberValues(sustainedRun, subscriber.id, 1).slice(0, 3)).toEqual(['0', '1', '2']);

	await expect
		.poll(async () => {
			const text = await simulationResults(page).textContent();
			return text ? text.split(', ').length : 0;
		})
		.toBe(100);

	// This intentionally uses Playwright's normal actionability checks. Before the animation
	// backlog was bounded, the main thread stopped responding before this click could complete.
	await page.getByRole('button', { name: 'stop simulation' }).click();
	await waitForWorkerProbe(page, (snapshot) => snapshot.terminated === 1);
	await expect(page.getByRole('button', { name: 'stop simulation' })).toBeDisabled();
	await expect(simulationResults(page)).toHaveText('');
});
