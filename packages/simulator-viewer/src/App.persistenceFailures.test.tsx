// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRootStore } from './store/rootStore';
import { spyOnConsole } from './test-utils';
import { persistDiagram } from './persistence';

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

	// Recovery (retry/backoff for a rejected write) is a product behavior change deliberately left
	// out of this characterization. See https://github.com/maklja/vision/issues/78.
	it.skip('recovers a rejected write without a subsequent editor change', async () => {
		setMock.mockRejectedValueOnce(new Error('write failed')).mockResolvedValue(undefined);

		render(<App />);
		await screen.findByLabelText('loaded elements');
		await flushPersistence();

		fireEvent.click(screen.getByRole('button', { name: 'Add element' }));
		await flushPersistence();

		// Once recovery exists, the failed snapshot should be retried without another editor change.
		await waitFor(() => {
			expect(setMock).toHaveBeenCalledTimes(2);
		});
	});
});
