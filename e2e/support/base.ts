/**
 * Origin that serves the generated production viewer build for the browser journeys.
 * It matches the port used by the Playwright `webServer` preview.
 */
export const E2E_ORIGIN = 'http://127.0.0.1:4173';

/**
 * Base path the viewer build is served from. The runner builds the viewer with this Vite base so
 * the GitHub Pages smoke journey exercises the same subpath deployment it will ship under.
 */
export const E2E_BASE_PATH = process.env.VISION_BASE_PATH ?? '/vision/';

/** Absolute URL of the editor entry document below the configured base path. */
export const E2E_EDITOR_URL = new URL(E2E_BASE_PATH, `${E2E_ORIGIN}/`).toString();

/** Pathname prefix every viewer asset must be requested below, e.g. `/vision/`. */
export const E2E_BASE_PATH_PREFIX = new URL(E2E_BASE_PATH, `${E2E_ORIGIN}/`).pathname;
