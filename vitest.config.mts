import { defineConfig } from 'vitest/config';

export default defineConfig({
	resolve: {
		alias: {
			konva: 'konva/lib/index.js',
		},
	},
	test: {
		include: ['packages/**/*.test.{ts,tsx}'],
		setupFiles: ['packages/simulator-viewer/src/test-utils/setup.ts'],
		environmentMatchGlobs: [['packages/simulator-viewer/**', 'jsdom']],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json-summary', 'html'],
			reportsDirectory: 'coverage',
			all: true,
			include: ['packages/*/src/**/*.{ts,tsx}'],
			exclude: [
				'**/*.d.ts',
				'**/*.test.{ts,tsx}',
				'**/index.ts',
				'packages/simulator-viewer/src/test-utils/**',
				'packages/simulator-viewer/src/reportWebVitals.ts',
			],
		},
	},
});
