import { defineConfig, devices } from '@playwright/test';
import { E2E_BASE_PATH, E2E_EDITOR_URL } from './e2e/support/base';

export default defineConfig({
	testDir: './e2e',
	fullyParallel: false,
	forbidOnly: Boolean(process.env.CI),
	// Characterization journeys must fail loudly: no retries, one worker, no fixed delays.
	retries: 0,
	workers: 1,
	// CI selects one browser per job, so growth in another browser cannot consume its budget.
	// Keep a finite suite deadline in addition to individual test and web-server timeouts.
	globalTimeout: 10 * 60_000,
	reporter: [
		['list', { printSteps: true }],
		['html', { open: 'never' }],
	],
	expect: {
		timeout: 15_000,
	},
	use: {
		// Every journey navigates through the configured base path instead of assuming `/`.
		baseURL: E2E_EDITOR_URL,
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure',
		viewport: { width: 1280, height: 720 },
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
		{
			name: 'firefox',
			use: { ...devices['Desktop Firefox'] },
		},
		{
			name: 'webkit',
			use: { ...devices['Desktop Safari'] },
		},
	],
	webServer: {
		// Build the production viewer with the GitHub Pages base path and serve that exact
		// artifact with Vite preview. The ordinary `pnpm build` stays on the root base.
		command:
			'pnpm --filter @maklja/vision-simulator-viewer build && ' +
			'node packages/simulator-viewer/node_modules/vite/bin/vite.js preview ' +
			'packages/simulator-viewer --host 127.0.0.1 --port 4173 --strictPort',
		env: {
			VISION_BASE_PATH: E2E_BASE_PATH,
			VITE_CHECKER_ENABLE: 'false',
		},
		url: E2E_EDITOR_URL,
		// Launch Vite directly: SIGTERM then stops the preview without pnpm reporting a failed
		// recursive script. Keep process-group cleanup bounded so port 4173 is released.
		gracefulShutdown: {
			signal: 'SIGTERM',
			timeout: 1_000,
		},
		// The suite owns its build and preview lifecycle; never reuse a stray server on the port.
		reuseExistingServer: false,
		timeout: 180_000,
	},
});
