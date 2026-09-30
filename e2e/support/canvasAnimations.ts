import { expect, Page } from '@playwright/test';

/**
 * Observes the canvas animation registry instead of the store's simulation events. Konva keeps every
 * running `Animation` in a static collection and each drawer tween registers one, so the size of
 * that collection is the number of animation frames the rendered canvas is currently driving.
 */
export async function readRunningCanvasAnimations(page: Page): Promise<number> {
	return page.evaluate(() => {
		const animations = (globalThis as { Konva?: { Animation?: { animations?: unknown } } })
			.Konva?.Animation?.animations;
		// Konva 10 replaced the running-animation array with a Set.
		if (!(animations instanceof Set)) {
			throw new Error(
				'Konva animation registry is unavailable, so canvas animations cannot be observed',
			);
		}

		return animations.size;
	});
}

/** Waits until the canvas is driving at least one animation frame. */
export async function waitForRunningCanvasAnimations(page: Page): Promise<void> {
	await expect.poll(() => readRunningCanvasAnimations(page)).toBeGreaterThan(0);
}

/** Waits until the canvas stops driving animation frames. */
export async function waitForCanvasAnimationsToSettle(page: Page): Promise<void> {
	await expect.poll(() => readRunningCanvasAnimations(page)).toBe(0);
}
