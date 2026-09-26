// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRootStore } from './store/rootStore';
import { spyOnConsole } from './test-utils';
import { persistDiagram, subscribeDiagramPersistence } from './persistence';

const { getMock, setMock, capturedStore } = vi.hoisted(() => ({
	getMock: vi.fn(),
	setMock: vi.fn(),
	capturedStore: { current: null as unknown },
}));

vi.mock('idb-keyval', () => ({
	get: getMock,
	set: setMock,
}));

vi.mock('./simulator', async () => {
	const { StoreContext, useRootStore } = await vi.importActual<
		typeof import('./store/rootStore')
	>('./store/rootStore');
	const { useContext } = await vi.importActual<typeof import('react')>('react');
	const { ElementType } = await vi.importActual<typeof import('@maklja/vision-simulator-model')>(
		'@maklja/vision-simulator-model',
	);
	const { createElement } = await vi.importActual<typeof import('./test-utils')>('./test-utils');

	return {
		Simulator() {
			const store = useContext(StoreContext);
			capturedStore.current = store;

			const elementNames = useRootStore((state) =>
				Object.values(state.elements)
					.map((element) => element.name)
					.join(', '),
			);
			const updateCanvasState = useRootStore((state) => state.updateCanvasState);
			const addElement = useRootStore((state) => state.addElement);

			return (
				<>
					<output aria-label="loaded elements">{elementNames}</output>
					<button type="button" onClick={() => updateCanvasState({ x: 5, y: 6 })}>
						Move canvas
					</button>
					<button
						type="button"
						onClick={() => addElement(createElement(ElementType.Map, { id: 'added' }))}
					>
						Add element
					</button>
				</>
			);
		},
	};
});

import App from './App';

async function flushPersistence() {
	await act(async () => {
		await new Promise((resolve) => setTimeout(resolve, 0));
	});
}

const emptyDiagram = {
	elements: [],
	connectLines: [],
	canvasState: { x: 0, y: 0, scaleX: 1, scaleY: 1 },
	themeId: 'sea',
};

async function flushPromises() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

interface ScheduledRetry {
	callback: () => void;
	delayMs: number;
	cancelled: boolean;
}

// Deterministic scheduler so recovery tests never depend on real timers.
function createTestScheduler() {
	const scheduled: ScheduledRetry[] = [];

	return {
		scheduled,
		scheduler: {
			schedule(callback: () => void, delayMs: number) {
				const retry: ScheduledRetry = { callback, delayMs, cancelled: false };
				scheduled.push(retry);
				return () => {
					retry.cancelled = true;
				};
			},
		},
		runScheduledRetry() {
			const retry = scheduled.shift();
			if (!retry) {
				throw new Error('No retry was scheduled.');
			}
			retry.callback();
		},
	};
}

describe('App persistence failures', () => {
	let console_: ReturnType<typeof spyOnConsole>;

	beforeEach(() => {
		getMock.mockReset();
		setMock.mockReset();
		getMock.mockResolvedValue(undefined);
		setMock.mockResolvedValue(undefined);
		console_ = spyOnConsole();
	});

	afterEach(() => {
		console_.restore();
		cleanup();
	});

	it('falls back to an empty store and reports when the read is rejected', async () => {
		getMock.mockRejectedValue(new Error('read failed'));

		render(<App />);

		expect((await screen.findByLabelText('loaded elements')).textContent).toBe('');
		await flushPersistence();

		expect(console_.error).toHaveBeenCalledWith(
			expect.stringContaining('Failed to load data from database.'),
		);
		expect(screen.getByRole('button', { name: 'Move canvas' })).not.toBeNull();
	});

	it('falls back safely for malformed stored data without leaving the editor unmounted', async () => {
		getMock.mockResolvedValue({ ...emptyDiagram, elements: 'not-an-array' });

		render(<App />);

		expect((await screen.findByLabelText('loaded elements')).textContent).toBe('');
		await flushPersistence();

		expect(console_.error).toHaveBeenCalledWith(
			expect.stringContaining('Failed to load data from database.'),
		);
		expect(screen.getByLabelText('loaded elements')).not.toBeNull();
	});

	it('observes a rejected write without crashing the mounted editor', async () => {
		setMock.mockRejectedValue(new Error('write failed'));

		render(<App />);
		await screen.findByLabelText('loaded elements');
		await flushPersistence();

		fireEvent.click(screen.getByRole('button', { name: 'Move canvas' }));

		await waitFor(() => {
			expect(console_.error).toHaveBeenCalledWith(
				expect.stringContaining('Failed to save data to database.'),
			);
		});
		expect(screen.getByRole('button', { name: 'Move canvas' })).not.toBeNull();
		expect(screen.getByLabelText('loaded elements')).not.toBeNull();
	});

	it('propagates the existing rejected write promise through the persistence seam', async () => {
		setMock.mockRejectedValue(new Error('write failed'));

		await expect(persistDiagram(emptyDiagram)).rejects.toThrow('write failed');
	});

	it('disposes the persistence subscription when the application unmounts', async () => {
		render(<App />);
		await screen.findByLabelText('loaded elements');
		await flushPersistence();

		const store = capturedStore.current as ReturnType<typeof createRootStore>;
		expect(store).not.toBeNull();

		cleanup();

		store.getState().updateCanvasState({ x: 20 });
		await flushPersistence();
		expect(setMock).not.toHaveBeenCalled();
	});
});

describe('diagram persistence recovery', () => {
	beforeEach(() => {
		getMock.mockReset();
		setMock.mockReset();
		getMock.mockResolvedValue(undefined);
		setMock.mockResolvedValue(undefined);
	});

	it('retries a rejected write and persists the latest diagram without another editor change', async () => {
		const { scheduler, runScheduledRetry, scheduled } = createTestScheduler();
		const store = createRootStore();
		const errors: unknown[] = [];
		setMock.mockRejectedValueOnce(new Error('write failed')).mockResolvedValue(undefined);

		const unsubscribe = subscribeDiagramPersistence(store, (error) => errors.push(error), {
			scheduler,
		});

		store.getState().updateCanvasState({ x: 10 });
		await flushPromises();

		expect(setMock).toHaveBeenCalledTimes(1);
		expect(errors).toHaveLength(1);
		expect(scheduled).toHaveLength(1);
		expect(scheduled[0].delayMs).toBe(1000);

		runScheduledRetry();
		await flushPromises();

		expect(setMock).toHaveBeenCalledTimes(2);
		expect(setMock).toHaveBeenLastCalledWith(
			'test',
			expect.objectContaining({ canvasState: { x: 10, y: 0, scaleX: 1, scaleY: 1 } }),
		);

		unsubscribe();
	});

	it('retries through the default scheduler after the configured backoff', async () => {
		const store = createRootStore();
		setMock.mockRejectedValueOnce(new Error('write failed')).mockResolvedValue(undefined);

		subscribeDiagramPersistence(store, () => undefined, { retryDelayMs: 5 });

		store.getState().updateCanvasState({ x: 42 });
		await flushPromises();
		expect(setMock).toHaveBeenCalledTimes(1);

		await waitFor(() => {
			expect(setMock).toHaveBeenCalledTimes(2);
		});
		expect(setMock).toHaveBeenLastCalledWith(
			'test',
			expect.objectContaining({ canvasState: { x: 42, y: 0, scaleX: 1, scaleY: 1 } }),
		);
	});

	it('backs off exponentially and gives up after the bounded number of attempts', async () => {
		const { scheduler, runScheduledRetry, scheduled } = createTestScheduler();
		const store = createRootStore();
		const errors: unknown[] = [];
		setMock.mockRejectedValue(new Error('write failed'));

		subscribeDiagramPersistence(store, (error) => errors.push(error), {
			scheduler,
			maxAttempts: 3,
			retryDelayMs: 100,
		});

		store.getState().updateCanvasState({ x: 1 });
		await flushPromises();
		expect(setMock).toHaveBeenCalledTimes(1);
		expect(scheduled[0].delayMs).toBe(100);

		runScheduledRetry();
		await flushPromises();
		expect(setMock).toHaveBeenCalledTimes(2);
		expect(scheduled[0].delayMs).toBe(200);

		runScheduledRetry();
		await flushPromises();
		expect(setMock).toHaveBeenCalledTimes(3);
		expect(scheduled).toHaveLength(0);
		expect(errors).toHaveLength(3);
	});

	it('persists only the latest state when a change arrives during a failing write', async () => {
		const { scheduler, scheduled } = createTestScheduler();
		const store = createRootStore();
		setMock.mockRejectedValueOnce(new Error('write failed')).mockResolvedValue(undefined);

		subscribeDiagramPersistence(store, () => undefined, { scheduler });

		store.getState().updateCanvasState({ x: 1 });
		await flushPromises();
		expect(scheduled).toHaveLength(1);

		store.getState().updateCanvasState({ x: 2 });
		await flushPromises();

		expect(setMock).toHaveBeenCalledTimes(2);
		expect(scheduled[0].cancelled).toBe(true);
		expect(setMock).toHaveBeenLastCalledWith(
			'test',
			expect.objectContaining({ canvasState: { x: 2, y: 0, scaleX: 1, scaleY: 1 } }),
		);
	});

	it('writes the newest snapshot queued during a successful write', async () => {
		let resolveFirstWrite!: () => void;
		setMock
			.mockImplementationOnce(
				() =>
					new Promise<void>((resolve) => {
						resolveFirstWrite = resolve;
					}),
			)
			.mockResolvedValue(undefined);
		const { scheduler } = createTestScheduler();
		const store = createRootStore();

		subscribeDiagramPersistence(store, () => undefined, { scheduler });

		store.getState().updateCanvasState({ x: 1 });
		await flushPromises();
		expect(setMock).toHaveBeenCalledTimes(1);

		store.getState().updateCanvasState({ x: 2 });
		await flushPromises();
		expect(setMock).toHaveBeenCalledTimes(1);

		resolveFirstWrite();
		await flushPromises();

		expect(setMock).toHaveBeenCalledTimes(2);
		expect(setMock).toHaveBeenLastCalledWith(
			'test',
			expect.objectContaining({ canvasState: { x: 2, y: 0, scaleX: 1, scaleY: 1 } }),
		);
	});

	it('persists the newest snapshot with a fresh budget when a change arrives during a failing write', async () => {
		let rejectFirstWrite!: (error: unknown) => void;
		setMock
			.mockImplementationOnce(
				() =>
					new Promise<void>((_resolve, reject) => {
						rejectFirstWrite = reject;
					}),
			)
			.mockResolvedValue(undefined);
		const { scheduler, scheduled } = createTestScheduler();
		const store = createRootStore();
		const errors: unknown[] = [];

		subscribeDiagramPersistence(store, (error) => errors.push(error), {
			scheduler,
			maxAttempts: 1,
		});

		store.getState().updateCanvasState({ x: 1 });
		await flushPromises();

		// A newer change arrives while the first write is still in flight.
		store.getState().updateCanvasState({ x: 2 });
		await flushPromises();
		expect(setMock).toHaveBeenCalledTimes(1);

		rejectFirstWrite(new Error('write failed'));
		await flushPromises();

		expect(errors).toHaveLength(1);
		expect(scheduled).toHaveLength(0);
		expect(setMock).toHaveBeenCalledTimes(2);
		expect(setMock).toHaveBeenLastCalledWith(
			'test',
			expect.objectContaining({ canvasState: { x: 2, y: 0, scaleX: 1, scaleY: 1 } }),
		);
	});

	it('cancels a pending retry and stops writing after unsubscribe', async () => {
		const { scheduler, scheduled, runScheduledRetry } = createTestScheduler();
		const store = createRootStore();
		setMock.mockRejectedValue(new Error('write failed'));

		const unsubscribe = subscribeDiagramPersistence(store, () => undefined, { scheduler });

		store.getState().updateCanvasState({ x: 1 });
		await flushPromises();
		expect(scheduled).toHaveLength(1);

		unsubscribe();
		expect(scheduled[0].cancelled).toBe(true);

		store.getState().updateCanvasState({ x: 2 });
		await flushPromises();

		runScheduledRetry();
		await flushPromises();

		expect(setMock).toHaveBeenCalledTimes(1);
	});
});
