import { expect, Page } from '@playwright/test';

export interface WorkerProbeOutboundMessage {
	type: string;
}

export interface WorkerProbeInboundMessage {
	type: string;
	value: unknown;
	workerId: number;
}

export interface WorkerProbeSnapshot {
	created: number;
	terminated: number;
	outbound: WorkerProbeOutboundMessage[];
	inbound: WorkerProbeInboundMessage[];
}

/**
 * Installs a test-only initialization script that wraps the native `Worker` constructor.
 * Only the simulation worker is instrumented; every other worker keeps its native behavior.
 * The probe never leaves the browser test harness, so it cannot reach production bundles.
 */
export async function installWorkerProbe(page: Page): Promise<void> {
	await page.addInitScript(() => {
		const globalObject = window as unknown as {
			Worker: typeof Worker;
			__visionWorkerProbeInstalled?: boolean;
			__visionWorkerProbe?: { snapshot: () => unknown };
		};
		if (globalObject.__visionWorkerProbeInstalled) {
			return;
		}
		globalObject.__visionWorkerProbeInstalled = true;

		const NativeWorker = globalObject.Worker;
		const outbound: WorkerProbeOutboundMessage[] = [];
		const inbound: WorkerProbeInboundMessage[] = [];
		let created = 0;
		let terminated = 0;

		const probedTypes = new Set(['next', 'error', 'complete', 'creationError']);

		function isSimulationWorker(url: string | URL, options?: WorkerOptions) {
			if (options?.name === 'ObservableWorker') {
				return true;
			}

			const href = typeof url === 'string' ? url : url instanceof URL ? url.href : '';
			return href.includes('observableSimulationWorker') || href.includes('ObservableWorker');
		}

		function ProbedWorker(this: unknown, url: string | URL, options?: WorkerOptions) {
			const worker = new NativeWorker(url, options);
			if (!isSimulationWorker(url, options)) {
				return worker;
			}

			created += 1;
			const workerId = created;
			const nativePostMessage = worker.postMessage.bind(worker);
			const nativeTerminate = worker.terminate.bind(worker);

			worker.postMessage = function (message: unknown, transfer?: Transferable[]) {
				const type =
					message && typeof message === 'object' && 'type' in message
						? String((message as { type: unknown }).type)
						: 'unknown';
				outbound.push({ type });
				return nativePostMessage(message as never, transfer as never);
			} as Worker['postMessage'];

			worker.terminate = function () {
				terminated += 1;
				return nativeTerminate();
			};

			worker.addEventListener('message', (event: MessageEvent) => {
				const data = event.data as { type?: unknown; value?: unknown } | undefined;
				if (!data || typeof data !== 'object' || typeof data.type !== 'string') {
					return;
				}
				if (!probedTypes.has(data.type)) {
					return;
				}

				inbound.push({ type: data.type, value: data.value, workerId });
			});

			return worker;
		}

		ProbedWorker.prototype = NativeWorker.prototype;
		globalObject.Worker = ProbedWorker as unknown as typeof Worker;

		globalObject.__visionWorkerProbe = {
			snapshot: () => ({
				created,
				terminated,
				outbound: outbound.map((message) => ({ ...message })),
				inbound: inbound.map((message) => ({ ...message })),
			}),
		};
	});
}

export async function readWorkerProbe(page: Page): Promise<WorkerProbeSnapshot> {
	const snapshot = await page.evaluate(() => {
		const probe = (window as unknown as { __visionWorkerProbe?: { snapshot: () => unknown } })
			.__visionWorkerProbe;
		return probe ? probe.snapshot() : null;
	});

	if (!snapshot) {
		throw new Error('Worker probe is not installed; call installWorkerProbe first');
	}

	return snapshot as WorkerProbeSnapshot;
}

/**
 * Polling cadence for worker messages. The first evaluation is immediate and the following ones stay
 * tight so a journey notices a fast source promptly instead of waiting out the default backoff.
 */
const PROBE_POLL_INTERVALS = [0, 10, 25, 50, 100];

export async function waitForWorkerProbe(
	page: Page,
	predicate: (snapshot: WorkerProbeSnapshot) => boolean,
): Promise<WorkerProbeSnapshot> {
	await expect
		.poll(async () => predicate(await readWorkerProbe(page)), {
			intervals: PROBE_POLL_INTERVALS,
		})
		.toBe(true);
	return readWorkerProbe(page);
}
