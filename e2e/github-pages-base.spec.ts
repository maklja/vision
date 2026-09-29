import { expect, Page, Request, Response, test } from '@playwright/test';
import { E2E_BASE_PATH_PREFIX, E2E_EDITOR_URL } from './support/base';
import {
	bootstrapEditor,
	selectEntryOperator,
	simulationResults,
	startSimulation,
} from './support/editor';
import { basePathFixture, fixtureElement } from './support/fixtures';
import { seedPersistedDiagram } from './support/indexedDb';
import { installWorkerProbe, waitForWorkerProbe } from './support/workerProbe';

interface ViewerAssetObservation {
	/** Every viewer asset response, in request order. */
	responses: Response[];
	/** Script, stylesheet, dynamic chunk, and Worker requests that failed or escaped the base. */
	failures: string[];
}

/**
 * Assets the journey treats as part of the deployed viewer: the entry document, JavaScript, CSS,
 * dynamic chunks, and the simulation Worker. Optional icon metadata (favicon/apple-touch-icon) is
 * intentionally excluded so an unrelated 404 cannot stand in for a base-path regression.
 */
function isViewerAsset(request: Request): boolean {
	const resourceType = request.resourceType();
	if (resourceType === 'document' || resourceType === 'script' || resourceType === 'stylesheet') {
		return true;
	}

	// Chromium reports some chunk and Worker loads as `other`, so also match by extension/name.
	const pathname = new URL(request.url()).pathname;
	return pathname.endsWith('.js') || pathname.includes('observableSimulationWorker');
}

function isScriptLike(request: Request): boolean {
	return request.resourceType() === 'script' || new URL(request.url()).pathname.endsWith('.js');
}

function observeViewerAssets(page: Page): ViewerAssetObservation {
	const observation: ViewerAssetObservation = { responses: [], failures: [] };

	page.on('response', (response) => {
		const request = response.request();
		if (!isViewerAsset(request)) {
			return;
		}

		observation.responses.push(response);
		const pathname = new URL(request.url()).pathname;
		if (!pathname.startsWith(E2E_BASE_PATH_PREFIX)) {
			observation.failures.push(`Asset escaped ${E2E_BASE_PATH_PREFIX}: ${request.url()}`);
		} else if (response.status() >= 400) {
			observation.failures.push(`${response.status()} response for ${request.url()}`);
		}
	});

	page.on('requestfailed', (request) => {
		if (isViewerAsset(request)) {
			observation.failures.push(`Failed request for ${request.url()}`);
		}
	});

	return observation;
}

test('mounts the editor under the GitHub Pages base path and resolves its initial assets', async ({
	page,
}) => {
	const assets = observeViewerAssets(page);

	await bootstrapEditor(page);

	// The stage and primary controls mount when the app is served from the subpath.
	await expect(page.getByTestId('simulator-stage')).toBeVisible();
	await expect(page.getByLabel('Entry operator')).toBeVisible();
	await expect(page.getByRole('button', { name: 'start simulation' })).toBeVisible();

	// The entry document is served from `/vision/`, not the origin root.
	const documents = assets.responses.filter(
		(response) => response.request().resourceType() === 'document',
	);
	expect(documents[0]?.url()).toBe(E2E_EDITOR_URL);
	expect(documents[0]?.status()).toBe(200);
	expect(documents[0]?.headers()['content-type']).toContain('text/html');

	// The entry JavaScript and CSS bundles resolve below the base path as well.
	const scripts = assets.responses.filter((response) => isScriptLike(response.request()));
	const stylesheets = assets.responses.filter(
		(response) => response.request().resourceType() === 'stylesheet',
	);
	expect(scripts.length).toBeGreaterThan(0);
	expect(stylesheets.length).toBeGreaterThan(0);

	expect(assets.failures).toEqual([]);
});

test('runs a seeded graph and resolves its dynamic chunks and Worker below the base path', async ({
	page,
}) => {
	const assets = observeViewerAssets(page);
	const workerUrls: string[] = [];
	page.on('worker', (worker) => workerUrls.push(worker.url()));

	await installWorkerProbe(page);
	await bootstrapEditor(page);

	// Seed a minimal deterministic `of -> subscriber` graph, then reload it like a returning user.
	await seedPersistedDiagram(page, basePathFixture);
	await page.reload();
	await expect(page.getByTestId('simulator-stage')).toBeVisible();

	const initialScripts = new Set(
		assets.responses.filter((response) => isScriptLike(response.request())).map((r) => r.url()),
	);
	const newScriptUrls = () =>
		assets.responses
			.filter((response) => isScriptLike(response.request()))
			.map((response) => response.url())
			.filter((url) => !initialScripts.has(url));

	const source = fixtureElement(basePathFixture, 'base-path-source');
	await selectEntryOperator(page, source);
	await startSimulation(page);

	await expect(simulationResults(page)).toHaveText('1, 2, 3, 4');

	const probe = await waitForWorkerProbe(page, (snapshot) =>
		snapshot.inbound.some((message) => message.type === 'complete'),
	);
	expect(probe.created).toBe(1);
	expect(probe.terminated).toBe(1);

	// The lazily imported engine chunk is fetched from the base path once the graph starts.
	await expect
		.poll(() => newScriptUrls().filter((url) => !url.includes('observableSimulationWorker')))
		.not.toHaveLength(0);

	// The simulation Worker is created and its script resolves below the base path.
	await expect.poll(() => workerUrls.length).toBe(1);
	const workerPath = new URL(workerUrls[0]).pathname;
	expect(workerPath.startsWith(`${E2E_BASE_PATH_PREFIX}assets/`)).toBe(true);
	expect(workerPath).toMatch(/observableSimulationWorker-.+\.js$/);

	expect(assets.failures).toEqual([]);
});
