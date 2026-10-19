import { expect, test } from '@playwright/test';
import { ElementType } from '@maklja/vision-simulator-model';
import { basePathFixture, fixtureElement, infiniteSourceFixture } from './support/fixtures';
import { bootstrapEditorWithDiagram, selectEntryOperator, startSimulation } from './support/editor';
import { installWorkerProbe, waitForWorkerProbe } from './support/workerProbe';

test.use({ reducedMotion: 'reduce' });
for (const [type, properties, expected] of [
	[
		ElementType.Of,
		{ argsFactoryExpression: '() => [1, 2]' },
		['subscribe', 'next', 'next', 'complete', 'unsubscribe', 'run-ended'],
	],
	[ElementType.Empty, {}, ['subscribe', 'complete', 'unsubscribe', 'run-ended']],
	[
		ElementType.ThrowError,
		{ errorOrErrorFactory: '() => new Error("fixture failure")' },
		['subscribe', 'error', 'unsubscribe', 'run-ended'],
	],
] as const) {
	test(`Worker emits a complete protocol trace for ${type} with reduced motion`, async ({
		page,
	}) => {
		await installWorkerProbe(page, { trace: true });
		const source = { ...basePathFixture.elements[0], type, properties };
		await bootstrapEditorWithDiagram(page, {
			...basePathFixture,
			elements: [source, basePathFixture.elements[1]],
		});
		await selectEntryOperator(page, source);
		await startSimulation(page);
		const probe = await waitForWorkerProbe(page, (p) => p.terminated === 1);
		const events = probe.inbound.filter((m) => m.type === 'trace').map((m) => m.event!);
		expect(events.map((e) => e.kind)).toEqual(expected);
		events.forEach((e, i) => {
			expect(e.version).toBe(1);
			expect(e.seq).toBe(i + 1);
			if (i > 0) expect(e.timeMs).toBeGreaterThanOrEqual(events[i - 1].timeMs);
		});
		expect(events.at(-1)).toMatchObject({
			kind: 'run-ended',
			reason: type === ElementType.ThrowError ? 'error' : 'completed',
			teardownConfirmed: true,
		});
		expect(probe.inbound.filter((m) => m.type === 'complete')).toHaveLength(
			type === ElementType.ThrowError ? 0 : 1,
		);
		expect(probe.inbound.filter((m) => m.type === 'error')).toHaveLength(
			type === ElementType.ThrowError ? 1 : 0,
		);
	});
}
test('responsive stop acknowledges teardown and restart uses a fresh run identity', async ({
	page,
}) => {
	await installWorkerProbe(page, { trace: true });
	await bootstrapEditorWithDiagram(page, infiniteSourceFixture);
	await selectEntryOperator(page, fixtureElement(infiniteSourceFixture, 'interval'));
	await startSimulation(page);
	const first = await waitForWorkerProbe(page, (p) => p.inbound.some((m) => m.type === 'next'));
	const runId = first.inbound.find((m) => m.type === 'trace')!.event!.runId;
	await page.getByRole('button', { name: 'stop simulation' }).click();
	const stopped = await waitForWorkerProbe(page, (p) => p.terminated === 1);
	const events = stopped.inbound.filter((m) => m.type === 'trace').map((m) => m.event!);
	expect(events.at(-2)).toMatchObject({ kind: 'unsubscribe', reason: 'run-stop' });
	expect(events.at(-1)).toMatchObject({
		kind: 'run-ended',
		reason: 'cancelled',
		teardownConfirmed: true,
	});
	expect(stopped.inbound.some((m) => m.type === 'stopped')).toBe(true);
	await startSimulation(page);
	const restarted = await waitForWorkerProbe(page, (p) =>
		p.inbound.some((m) => m.workerId === 2 && m.type === 'next'),
	);
	const start = restarted.inbound.find((m) => m.workerId === 2 && m.type === 'trace')!.event!;
	expect(start.seq).toBe(1);
	expect(start.runId).not.toBe(runId);
	await page.getByRole('button', { name: 'stop simulation' }).click();
	await waitForWorkerProbe(page, (p) => p.terminated === 2);
});
