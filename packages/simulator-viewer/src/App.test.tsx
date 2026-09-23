// @vitest-environment jsdom

import 'fake-indexeddb/auto';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { clear, get, set } from 'idb-keyval';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ElementType } from '@maklja/vision-simulator-model';
import type { StateProps } from './store/rootStore';

vi.mock('./simulator', async () => {
	const { useRootStore } = await vi.importActual<typeof import('./store/rootStore')>(
		'./store/rootStore',
	);

	return {
		Simulator() {
			const elementNames = useRootStore((state) =>
				Object.values(state.elements)
					.map((element) => element.name)
					.join(', '),
			);
			const updateCanvasState = useRootStore((state) => state.updateCanvasState);

			return (
				<>
					<output aria-label="loaded elements">{elementNames}</output>
					<button type="button" onClick={() => updateCanvasState({ x: 250, y: 125 })}>
						Move canvas
					</button>
				</>
			);
		},
	};
});

import App from './App';

const diagramId = 'test';

describe('App persistence', () => {
	beforeEach(async () => {
		await clear();
	});

	afterEach(() => {
		cleanup();
	});

	it('restores a diagram and persists editor state without transient result elements', async () => {
		const storedDiagram: StateProps = {
			elements: [
				{
					id: 'source',
					type: ElementType.Of,
					name: 'of_0',
					x: 20,
					y: 30,
					visible: true,
					properties: {
						argsFactoryExpression: 'function argsFactory() { return [1, 2]; }',
					},
				},
				{
					id: 'transient-result',
					type: ElementType.Result,
					name: 'transient-result',
					x: 80,
					y: 30,
					visible: true,
					properties: {
						hash: 'result-hash',
					},
				},
			],
			connectLines: [],
			canvasState: { x: 0, y: 0, scaleX: 1, scaleY: 1 },
			themeId: 'sea',
		};
		await set(diagramId, storedDiagram);

		render(<App />);

		expect((await screen.findByLabelText('loaded elements')).textContent).toBe(
			'of_0, transient-result',
		);
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		fireEvent.click(screen.getByRole('button', { name: 'Move canvas' }));

		await waitFor(async () => {
			const persistedDiagram = await get<StateProps>(diagramId);
			expect(persistedDiagram?.canvasState).toEqual({
				x: 250,
				y: 125,
				scaleX: 1,
				scaleY: 1,
			});
			expect(persistedDiagram?.elements.map((element) => element.id)).toEqual(['source']);
		});
	});
});
