import { expect, Page } from '@playwright/test';

export interface WorkerProbeOutboundMessage {
	type: string;
}

export interface WorkerProbeInboundMessage {
	type: string;
	value: unknown;
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

				inbound.push({ type: data.type, value: data.value });
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

export async function waitForWorkerProbe(
	page: Page,
	predicate: (snapshot: WorkerProbeSnapshot) => boolean,
): Promise<WorkerProbeSnapshot> {
	await expect.poll(async () => predicate(await readWorkerProbe(page))).toBe(true);
	return readWorkerProbe(page);
}

/**
 * Yields the page's task queue until messages already posted by a terminated worker have been
 * delivered. This is an explicit event-loop synchronization signal rather than a fixed sleep: the
 * worker is stopped, so only a bounded set of queued message tasks remains to drain.
 */
export async function drainWorkerProbeTasks(page: Page): Promise<void> {
	await page.evaluate(
		() =>
			new Promise<void>((resolve) => {
				let remaining = 4;
				const tick = () => {
					remaining -= 1;
					if (remaining <= 0) {
						resolve();
						return;
					}

					setTimeout(tick, 0);
				};

				setTimeout(tick, 0);
			}),
	);
}

export interface WorkerProbeSilence {
	/** Real milliseconds observed in the page, measured with `performance.now()`. */
	elapsedMs: number;
	before: WorkerProbeSnapshot;
	after: WorkerProbeSnapshot;
}

/**
 * Observes an idle probe for at least `minimumMs` of real time and reports whether the page kept
 * running. The window is measured in the page so a caller can assert that real time actually
 * elapsed before trusting the lack of new messages. Cancellation of the `interval` source is proven
 * by worker termination; this only confirms no late message keeps reaching the viewer.
 */
export async function observeWorkerProbeSilence(
	page: Page,
	minimumMs: number,
): Promise<WorkerProbeSilence> {
	const observed = await page.evaluate(async (ms) => {
		const probe = (window as unknown as { __visionWorkerProbe?: { snapshot: () => unknown } })
			.__visionWorkerProbe;
		if (!probe) {
			throw new Error('Worker probe is not installed; call installWorkerProbe first');
		}

		const before = probe.snapshot();
		const start = performance.now();
		const sliceMs = Math.max(1, Math.floor(ms / 6));
		await new Promise<void>((resolve) => {
			const tick = () => {
				if (performance.now() - start >= ms) {
					resolve();
					return;
				}

				setTimeout(tick, sliceMs);
			};

			setTimeout(tick, sliceMs);
		});

		return { elapsedMs: performance.now() - start, before, after: probe.snapshot() };
	}, minimumMs);

	return observed as WorkerProbeSilence;
}
