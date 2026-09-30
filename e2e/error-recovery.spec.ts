import { expect, Page, test } from '@playwright/test';
import { FlowValueType } from '@maklja/vision-simulator-model';
import {
	bootstrapEditorWithDiagram,
	selectEntryOperator,
	simulationResults,
	startSimulation,
} from './support/editor';
import { waitForDiagram } from './support/indexedDb';
import { creationErrorFixture, fixtureElement, runtimeErrorFixture } from './support/fixtures';
import { installWorkerProbe, WorkerProbeSnapshot, waitForWorkerProbe } from './support/workerProbe';

interface FlowValueEventPayload {
	type: FlowValueType;
	value: string;
	sourceElementId: string;
	targetElementId: string;
	connectLinesId: string[];
}

interface CreationErrorPayload {
	sourceElementId: string;
	targetElementId: string;
	value: string;
}

function inboundMessages(probe: WorkerProbeSnapshot, type: string) {
	return probe.inbound.filter((message) => message.type === type);
}

/**
 * Captures browser-side error logging so the journeys can prove that only the expected engine
 * failure is reported. Any other console error or uncaught page error fails the assertion.
 */
function captureErrorLogging(page: Page) {
	const consoleErrors: string[] = [];
	const pageErrors: string[] = [];
	page.on('console', (message) => {
		if (message.type() === 'error') {
			consoleErrors.push(message.text());
		}
	});
	page.on('pageerror', (error) => pageErrors.push(error.message));

	return { consoleErrors, pageErrors };
}

test('recovers from a creation error and runs the sibling pipeline without reloading', async ({
	page,
	browserName,
}) => {
	const { consoleErrors, pageErrors } = captureErrorLogging(page);
	await installWorkerProbe(page);
	await bootstrapEditorWithDiagram(page, creationErrorFixture);

	const buffer = fixtureElement(creationErrorFixture, 'buffer');
	const goodSubscriber = fixtureElement(creationErrorFixture, 'good-subscriber');
	const goodSource = fixtureElement(creationErrorFixture, 'good-of');

	// The buffer element has no event reference, so the worker reports a creation error for it.
	await selectEntryOperator(page, fixtureElement(creationErrorFixture, 'bad-of'));
	await startSimulation(page);

	const failedProbe = await waitForWorkerProbe(page, (snapshot) =>
		snapshot.inbound.some((message) => message.type === 'creationError'),
	);
	const creationErrors = inboundMessages(failedProbe, 'creationError');
	expect(creationErrors).toHaveLength(1);
	expect((creationErrors[0].value as CreationErrorPayload).sourceElementId).toBe(buffer.id);
	expect((creationErrors[0].value as CreationErrorPayload).value).toContain('buffer');

	// The worker is torn down and the controls return to the stopped state.
	expect(failedProbe.terminated).toBeGreaterThanOrEqual(1);
	await expect(page.getByRole('button', { name: 'start simulation' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'reset simulation' })).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'stop simulation' })).toBeDisabled();

	// The diagram is untouched, so recovery never depended on an IndexedDB reset.
	const persisted = await waitForDiagram(
		page,
		(diagram) => (diagram?.elements.length ?? 0) === creationErrorFixture.elements.length,
	);
	expect(persisted.elements.map((element) => element.id).sort()).toEqual(
		creationErrorFixture.elements.map((element) => element.id).sort(),
	);

	// The valid sibling entry still runs to completion in a fresh worker.
	await selectEntryOperator(page, goodSource);
	await startSimulation(page);
	await expect(simulationResults(page)).toHaveText('1, 2, 3, 4');

	const recoveredProbe = await waitForWorkerProbe(page, (snapshot) =>
		snapshot.inbound.some((message) => message.type === 'complete'),
	);
	expect(recoveredProbe.created).toBe(2);
	expect(recoveredProbe.terminated).toBeGreaterThan(failedProbe.terminated);

	const subscriberValues = inboundMessages(recoveredProbe, 'next')
		.map((message) => message.value as FlowValueEventPayload)
		.filter((event) => event.targetElementId === goodSubscriber.id)
		.map((event) => event.value);
	expect(subscriberValues).toEqual(['1', '2', '3', '4']);

	// Across both runs the only reported failure is the creation error, once, through the worker's
	// uncaught-error path. Any unrelated page error or extra console error fails the journey.
	expect(pageErrors).toEqual([]);
	// Chromium forwards an uncaught error thrown inside a dedicated worker to the page, where the
	// engine's `error` listener logs it. Firefox and WebKit keep the worker silent, so that listener
	// never runs there. Recovery itself is engine independent and is asserted above through the
	// creation-error message, the terminated worker, and the restarted sibling pipeline, so only the
	// diagnostic log is engine specific.
	const expectedConsoleErrors =
		browserName === 'chromium'
			? [expect.stringContaining('Error is throw by ObservableWorker')]
			: [];
	expect(consoleErrors).toEqual(expectedConsoleErrors);
});

test('recovers from a runtime error and runs the sibling pipeline without reloading', async ({
	page,
}) => {
	const { consoleErrors, pageErrors } = captureErrorLogging(page);
	await installWorkerProbe(page);
	await bootstrapEditorWithDiagram(page, runtimeErrorFixture);

	const errorSource = fixtureElement(runtimeErrorFixture, 'throw-error');
	const goodSource = fixtureElement(runtimeErrorFixture, 'good-of');
	const goodSubscriber = fixtureElement(runtimeErrorFixture, 'good-subscriber');

	await selectEntryOperator(page, errorSource);
	await startSimulation(page);

	const failedProbe = await waitForWorkerProbe(page, (snapshot) =>
		snapshot.inbound.some((message) => message.type === 'error'),
	);
	const errorEvents = inboundMessages(failedProbe, 'error');
	expect(errorEvents).toHaveLength(1);
	expect((errorEvents[0].value as FlowValueEventPayload).sourceElementId).toBe(errorSource.id);

	expect(failedProbe.outbound.map((message) => message.type)).toContain('stopSimulation');
	expect(failedProbe.terminated).toBeGreaterThanOrEqual(1);

	await selectEntryOperator(page, goodSource);
	await startSimulation(page);
	await expect(simulationResults(page)).toHaveText('1, 2, 3, 4');

	const recoveredProbe = await waitForWorkerProbe(page, (snapshot) =>
		snapshot.inbound.some((message) => message.type === 'complete'),
	);
	const subscriberValues = inboundMessages(recoveredProbe, 'next')
		.map((message) => message.value as FlowValueEventPayload)
		.filter((event) => event.targetElementId === goodSubscriber.id)
		.map((event) => event.value);
	expect(subscriberValues).toEqual(['1', '2', '3', '4']);

	expect(pageErrors).toEqual([]);
	expect(consoleErrors).toEqual([]);
});
