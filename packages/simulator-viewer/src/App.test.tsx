// @vitest-environment jsdom

import 'fake-indexeddb/auto';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { clear, get, set } from 'idb-keyval';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	ConnectPointPosition,
	ConnectPointType,
	ElementType,
} from '@maklja/vision-simulator-model';
import type { StateProps } from './store/rootStore';

vi.mock('./simulator', async () => {
	const { useRootStore } = await vi.importActual<typeof import('./store/rootStore')>(
		'./store/rootStore',
	);
	const { ElementType: MockedElementType } = await vi.importActual<
		typeof import('@maklja/vision-simulator-model')
	>('@maklja/vision-simulator-model');
	const { createConnectLine, createElement } = await vi.importActual<
		typeof import('./test-utils')
	>('./test-utils');

	return {
		Simulator() {
			const elementNames = useRootStore((state) =>
				Object.values(state.elements)
					.map((element) => element.name)
					.join(', '),
			);
			const connectLineCount = useRootStore((state) => Object.keys(state.connectLines).length);
			const viewport = useRootStore(
				(state) =>
					`${state.canvasState.x},${state.canvasState.y},${state.canvasState.scaleX},${state.canvasState.scaleY}`,
			);
			const themeId = useRootStore((state) => state.theme.default.colors.id);
			const updateCanvasState = useRootStore((state) => state.updateCanvasState);
			const changeTheme = useRootStore((state) => state.changeTheme);
			const addElement = useRootStore((state) => state.addElement);
			const addConnectLine = useRootStore((state) => state.addConnectLine);

			return (
				<>
					<output aria-label="loaded elements">{elementNames}</output>
					<output aria-label="connect line count">{connectLineCount}</output>
					<output aria-label="viewport">{viewport}</output>
					<output aria-label="theme">{themeId}</output>
					<button type="button" onClick={() => updateCanvasState({ x: 250, y: 125 })}>
						Move canvas
					</button>
					<button type="button" onClick={() => changeTheme('winter')}>
						Switch theme
					</button>
					<button
						type="button"
						onClick={() => addElement(createElement(MockedElementType.Map, { id: 'added' }))}
					>
						Add element
					</button>
					<button
						type="button"
						onClick={() => addElement(createElement(MockedElementType.Result, { id: 'transient' }))}
					>
						Add result element
					</button>
					<button
						type="button"
						onClick={() => addConnectLine(createConnectLine({ id: 'line-1' }))}
					>
						Add connect line
					</button>
				</>
			);
		},
	};
});

import App from './App';

const diagramId = 'test';

async function flushPersistence() {
	await act(async () => {
		await new Promise((resolve) => setTimeout(resolve, 0));
	});
}

async function renderApp() {
	render(<App />);
	await screen.findByLabelText('loaded elements');
	await flushPersistence();
}

async function readPersistedDiagram() {
	return get<StateProps>(diagramId);
}

describe('App IndexedDB persistence', () => {
	beforeEach(async () => {
		await clear();
	});

	afterEach(() => {
		cleanup();
	});

	it('creates an empty default store when nothing is stored', async () => {
		await renderApp();

		expect(screen.getByLabelText('loaded elements').textContent).toBe('');
		expect(screen.getByLabelText('connect line count').textContent).toBe('0');
		expect(screen.getByLabelText('viewport').textContent).toBe('0,0,1,1');
		expect(screen.getByLabelText('theme').textContent).toBe('sea');
		await expect(readPersistedDiagram()).resolves.toBeUndefined();
	});

	it('restores elements, connect lines, viewport and theme', async () => {
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
					id: 'transformation',
					type: ElementType.Map,
					name: 'map_0',
					x: 200,
					y: 30,
					visible: true,
					properties: {},
				},
			],
			connectLines: [
				{
					id: 'source-transformation',
					source: {
					id: 'source',
					connectPointType: ConnectPointType.Output,
					connectPosition: ConnectPointPosition.Right,
				},
					target: {
					id: 'transformation',
					connectPointType: ConnectPointType.Input,
					connectPosition: ConnectPointPosition.Left,
				},
					points: [{ x: 0, y: 0 }, { x: 10, y: 0 }],
					locked: false,
					index: 1,
					name: 'source-transformation',
				},
			],
			canvasState: { x: 40, y: 50, scaleX: 2, scaleY: 3 },
			themeId: 'winter',
		};
		await set(diagramId, storedDiagram);

		await renderApp();

		expect(screen.getByLabelText('loaded elements').textContent).toBe('of_0, map_0');
		expect(screen.getByLabelText('connect line count').textContent).toBe('1');
		expect(screen.getByLabelText('viewport').textContent).toBe('40,50,2,3');
		expect(screen.getByLabelText('theme').textContent).toBe('winter');
	});

	it('persists element changes as an array in the stored shape', async () => {
		await renderApp();

		fireEvent.click(screen.getByRole('button', { name: 'Add element' }));

		await waitFor(async () => {
			const persistedDiagram = await readPersistedDiagram();
			expect(Array.isArray(persistedDiagram?.elements)).toBe(true);
			expect(persistedDiagram?.elements.map((element) => element.id)).toEqual(['added']);
		});
	});

	it('persists connection changes as an array in the stored shape', async () => {
		await renderApp();

		fireEvent.click(screen.getByRole('button', { name: 'Add connect line' }));

		await waitFor(async () => {
			const persistedDiagram = await readPersistedDiagram();
			expect(Array.isArray(persistedDiagram?.connectLines)).toBe(true);
			expect(persistedDiagram?.connectLines.map((line) => line.id)).toEqual(['line-1']);
		});
	});

	it('persists viewport changes', async () => {
		await renderApp();

		fireEvent.click(screen.getByRole('button', { name: 'Move canvas' }));

		await waitFor(async () => {
			const persistedDiagram = await readPersistedDiagram();
			expect(persistedDiagram?.canvasState).toEqual({
				x: 250,
				y: 125,
				scaleX: 1,
				scaleY: 1,
			});
		});
	});

	it('persists theme changes', async () => {
		await renderApp();

		fireEvent.click(screen.getByRole('button', { name: 'Switch theme' }));

		await waitFor(async () => {
			const persistedDiagram = await readPersistedDiagram();
			expect(persistedDiagram?.themeId).toBe('winter');
		});
	});

	it('persists the latest state after multiple changes', async () => {
		await renderApp();

		fireEvent.click(screen.getByRole('button', { name: 'Add element' }));
		fireEvent.click(screen.getByRole('button', { name: 'Add connect line' }));
		fireEvent.click(screen.getByRole('button', { name: 'Move canvas' }));
		fireEvent.click(screen.getByRole('button', { name: 'Switch theme' }));

		await waitFor(async () => {
			const persistedDiagram = await readPersistedDiagram();
			expect(persistedDiagram).toMatchObject({
				canvasState: { x: 250, y: 125, scaleX: 1, scaleY: 1 },
				themeId: 'winter',
			});
			expect(persistedDiagram?.elements.map((element) => element.id)).toEqual(['added']);
			expect(persistedDiagram?.connectLines.map((line) => line.id)).toEqual(['line-1']);
		});
	});

	it('excludes transient result elements while preserving editor state', async () => {
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

		await renderApp();
		expect(screen.getByLabelText('loaded elements').textContent).toBe('of_0, transient-result');

		fireEvent.click(screen.getByRole('button', { name: 'Add connect line' }));

		await waitFor(async () => {
			const persistedDiagram = await readPersistedDiagram();
			expect(persistedDiagram?.elements.map((element) => element.id)).toEqual(['source']);
			expect(persistedDiagram?.connectLines.map((line) => line.id)).toEqual(['line-1']);
		});
	});

	it('does not persist transient result elements added while editing', async () => {
		await renderApp();

		fireEvent.click(screen.getByRole('button', { name: 'Add result element' }));
		fireEvent.click(screen.getByRole('button', { name: 'Move canvas' }));

		await waitFor(async () => {
			const persistedDiagram = await readPersistedDiagram();
			expect(persistedDiagram?.elements).toEqual([]);
			expect(persistedDiagram?.canvasState).toEqual({
				x: 250,
				y: 125,
				scaleX: 1,
				scaleY: 1,
			});
		});
	});
});
