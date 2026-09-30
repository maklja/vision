import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';

export default defineConfig(() => {
	// The viewer is normally served from the origin root. The GitHub Pages smoke journey sets
	// `VISION_BASE_PATH` so the same build can be served from a subpath like `/vision/`.
	const base = process.env.VISION_BASE_PATH ?? '/';

	return {
		base,
		build: {
			outDir: 'build',
		},
		server: {
			port: 3000,
		},
		plugins: [
			react(),
			// CI has a dedicated TypeScript gate. Playwright starts a short-lived preview process,
			// so its web-server command disables the checker's long-lived worker explicitly.
			process.env.VITE_CHECKER_ENABLE !== 'false' &&
				checker({
					typescript: true,
				}),
		],
	};
});
