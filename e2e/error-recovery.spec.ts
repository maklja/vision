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

interface CreationErrorDiagnostic {
	elementId: string;
	category: string;
	phase: string;
	message: string;
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
	const diagnostic = creationErrors[0].diagnostic as CreationErrorDiagnostic;
	expect(diagnostic).toMatchObject({
		elementId: buffer.id,
		category: 'reference',
		phase: 'preflight',
	});
	expect(diagnostic.message).toContain('references');

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

	// Construction failures are structured diagnostics; they no longer escape as uncaught
	// Worker errors or dump authored execution data into the browser console.
	expect(pageErrors).toEqual([]);
	expect(consoleErrors).toEqual([]);
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

	expect(failedProbe.outbound.map((message) => message.type)).toEqual(['startSimulation']);
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
