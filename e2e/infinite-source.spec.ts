import { expect, test } from '@playwright/test';
import {
	bootstrapEditorWithDiagram,
	clickControlAt,
	resolveControlPoint,
	selectEntryOperator,
	simulationResults,
	startSimulation,
} from './support/editor';
import { fixtureElement, infiniteSourceFixture } from './support/fixtures';
import {
	readRunningCanvasAnimations,
	waitForCanvasAnimationsToSettle,
	waitForRunningCanvasAnimations,
} from './support/canvasAnimations';
import {
	installWorkerProbe,
	WorkerProbeSnapshot,
	waitForWorkerProbe,
} from './support/workerProbe';

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
	// Resolve the Stop target while the editor is idle. The time-based source keeps the main thread
	// busy while it runs, so the pointer event is dispatched directly instead of asking the page to
	// verify the hit target.
	const stopPoint = await resolveControlPoint(page, 'stop simulation');

	// First run: the time-based source emits a strictly ordered value sequence.
	await selectEntryOperator(page, interval);
	await startSimulation(page);
	await expect(palette).toBeDisabled();

	const running = await waitForWorkerProbe(
		page,
		(snapshot) => subscriberValues(snapshot, subscriber.id, 1).length >= 3,
	);
	expect(running.created).toBe(1);
	const firstRunValues = subscriberValues(running, subscriber.id, 1);
	expect(firstRunValues.slice(0, 3)).toEqual(['0', '1', '2']);
	expect(firstRunValues).toEqual(firstRunValues.map((_value, index) => String(index)));

	// The canvas is really animating while the source runs, so the settling check below is not
	// satisfied by a canvas that never animated in the first place.
	await waitForRunningCanvasAnimations(page);
	expect(await readRunningCanvasAnimations(page)).toBeGreaterThan(0);

	// Stop the real time-based source.
	await clickControlAt(page, stopPoint);

	const stopped = await waitForWorkerProbe(page, (snapshot) =>
		snapshot.outbound.some((message) => message.type === 'stopSimulation'),
	);
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

	const restarted = await waitForWorkerProbe(
		page,
		(snapshot) => subscriberValues(snapshot, subscriber.id, 2).length >= 3,
	);
	expect(restarted.created).toBe(2);
	expect(subscriberValues(restarted, subscriber.id, 2).slice(0, 3)).toEqual(['0', '1', '2']);

	// The second worker is torn down independently. The control did not move while the page was idle,
	// so the Stop point resolved before the first run is still valid.
	await clickControlAt(page, stopPoint);
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

// Skipped pending #99: stopping clears the simulation queue but not the drawer animation registry, so
// the restarted run keeps the previous run's stale entries and never starts another canvas
// animation. Remove the skip once those animations are cleared on reset.
test.skip('restarts the infinite interval source with fresh canvas animations', async ({
	page,
}) => {
	await installWorkerProbe(page);
	await bootstrapEditorWithDiagram(page, infiniteSourceFixture);

	const interval = fixtureElement(infiniteSourceFixture, 'interval');
	const subscriber = fixtureElement(infiniteSourceFixture, 'interval-subscriber');
	const stopPoint = await resolveControlPoint(page, 'stop simulation');

	await selectEntryOperator(page, interval);
	await startSimulation(page);
	await waitForWorkerProbe(
		page,
		(snapshot) => subscriberValues(snapshot, subscriber.id, 1).length >= 3,
	);
	await clickControlAt(page, stopPoint);
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
