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
			// Phase 1.4 gate: viewer store code and non-canvas UI code must stay characterized.
			// Canvas drawers and Konva rendering stay in the report but outside this threshold.
			thresholds: {
				'packages/simulator-viewer/src/store/**': {
					statements: 70,
					functions: 70,
					branches: 70,
					lines: 70,
				},
				'packages/simulator-viewer/src/ui/**': {
					statements: 70,
					functions: 70,
					branches: 70,
					lines: 70,
				},
			},
		},
	},
});
