import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './e2e',
	fullyParallel: false,
	forbidOnly: Boolean(process.env.CI),
	// Characterization journeys must fail loudly: no retries, one worker, no fixed delays.
	retries: 0,
	workers: 1,
	reporter: [['list'], ['html', { open: 'never' }]],
	expect: {
		timeout: 15_000,
	},
	use: {
		baseURL: 'http://127.0.0.1:4173',
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure',
		viewport: { width: 1280, height: 720 },
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
	],
	webServer: {
		command: 'pnpm --filter @maklja/vision-simulator-viewer start --host 127.0.0.1 --port 4173',
		url: 'http://127.0.0.1:4173',
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
