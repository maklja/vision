// @vitest-environment jsdom

import 'fake-indexeddb/auto';
import { clear } from 'idb-keyval';
import { DiagramRepository, subscribeDiagramPersistence } from '../persistence/diagramPersistence';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	CommonProps,
	DueDateType,
	ConnectPointPosition,
	ConnectPointType,
	ElementType,
} from '@maklja/vision-simulator-model';
import {
	createConnectLine,
	createElement,
	createStoreWrapper,
	createTestStore,
} from '../test-utils';
import { SimulatorProperties } from './SimulatorProperties';

function renderProperties(store = createTestStore()) {
	const Wrapper = createStoreWrapper(store);
	render(
		<Wrapper>
			<SimulatorProperties />
		</Wrapper>,
	);
	return store;
}

function withGraph() {
	return createTestStore({
		elements: [
			createElement(ElementType.Of, { id: 'of-1', name: 'source', x: 10, y: 20 }),
			createElement(ElementType.Interval, {
				id: 'interval-1',
				name: 'ticks',
				properties: { period: 1_000 },
			}),
			createElement(ElementType.From, {
				id: 'from-1',
				name: 'converter',
				properties: {
					enableObservableEvent: true,
					observableFactory: '() => of(1)',
					inputCallbackExpression: '[1]',
				},
			}),
		],
		connectLines: [
			createConnectLine({
				id: 'cl-event',
				source: {
					id: 'from-1',
					connectPointType: ConnectPointType.Event,
					connectPosition: ConnectPointPosition.Right,
				},
				target: {
					id: 'of-1',
					connectPointType: ConnectPointType.Input,
					connectPosition: ConnectPointPosition.Left,
				},
			}),
			createConnectLine({
				id: 'cl-output',
				source: {
					id: 'of-1',
					connectPointType: ConnectPointType.Output,
					connectPosition: ConnectPointPosition.Right,
				},
				target: {
					id: 'from-1',
					connectPointType: ConnectPointType.Input,
					connectPosition: ConnectPointPosition.Left,
				},
			}),
		],
	});
}

describe('SimulatorProperties', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders no panel when nothing is selected', () => {
		renderProperties();

		expect(screen.queryByText(/Element details/)).toBeNull();
	});

	it('renders no panel when more than one element is selected', () => {
		const store = withGraph();
		store.getState().setSelectElements(['of-1', 'interval-1']);

		renderProperties(store);

		expect(screen.queryByText(/Element details/)).toBeNull();
	});

	it('renders the panel for exactly one selected element', () => {
		const store = withGraph();
		store.getState().setSelectElements(['interval-1']);

		renderProperties(store);

		expect(screen.getByText('Element details: ticks')).toBeDefined();
		expect(screen.getByText('Element explorer')).toBeDefined();
		expect(screen.getAllByText('Period').length).toBeGreaterThan(0);
	});

	it('minimizes and restores the panel through the window shell', () => {
		const store = withGraph();
		store.getState().setSelectElements(['interval-1']);
		renderProperties(store);

		act(() => {
			fireEvent.click(screen.getByRole('button', { name: 'Minimize' }));
		});

		expect(screen.queryByText('Element explorer')).toBeNull();

		act(() => {
			fireEvent.click(screen.getByRole('button', { name: 'ticks' }));
		});

		expect(screen.getByText('Element explorer')).toBeDefined();
	});

	it('updates the stored element name and position', () => {
		const store = withGraph();
		store.getState().setSelectElements(['interval-1']);
		renderProperties(store);

		fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'renamed' } });
		fireEvent.change(screen.getByLabelText('X'), { target: { value: '42' } });

		expect(store.getState().elements['interval-1'].name).toBe('renamed');
		expect(store.getState().elements['interval-1'].x).toBe(42);
	});

	it('updates the stored operator property', () => {
		const store = withGraph();
		store.getState().setSelectElements(['interval-1']);
		renderProperties(store);

		fireEvent.change(screen.getByLabelText('Period'), { target: { value: '2500' } });

		expect(store.getState().elements['interval-1'].properties).toMatchObject({
			period: { kind: 'literal', type: 'number', value: 2500 },
		});
	});

	it('removes event connect lines when an observable event property is disabled', () => {
		const store = withGraph();
		store.getState().setSelectElements(['from-1']);
		renderProperties(store);

		const checkbox = screen.getByLabelText('Observable event') as HTMLInputElement;
		expect(checkbox.checked).toBe(true);

		fireEvent.click(checkbox);

		expect(store.getState().elements['from-1'].properties).toMatchObject({
			[CommonProps.EnableObservableEvent]: false,
		});
		expect(store.getState().connectLines['cl-event']).toBeUndefined();
		expect(store.getState().connectLines['cl-output']).toBeDefined();
	});

	it('forwards connect line changes for join creation operators', () => {
		// The observable-input list is built from the selected element's outgoing event lines, so
		// the join creation operator is the connect line source in this characterization.
		const store = createTestStore({
			elements: [
				createElement(ElementType.Merge, {
					id: 'merge-1',
					name: 'merged',
					properties: { limitConcurrent: 1 },
				}),
				createElement(ElementType.CombineLatest, { id: 'combine-1', name: 'combined' }),
			],
			connectLines: [
				createConnectLine({
					id: 'cl-event',
					source: {
						id: 'merge-1',
						connectPointType: ConnectPointType.Event,
						connectPosition: ConnectPointPosition.Top,
					},
					target: {
						id: 'combine-1',
						connectPointType: ConnectPointType.Input,
						connectPosition: ConnectPointPosition.Left,
					},
					index: 1,
				}),
			],
		});
		store.getState().setSelectElements(['merge-1']);
		renderProperties(store);

		expect(screen.getAllByText('Index').length).toBeGreaterThan(0);
		fireEvent.change(screen.getByLabelText('Index'), { target: { value: '4' } });

		expect(store.getState().connectLines['cl-event'].index).toBe(4);
	});
});

it('autosaves timer mode and typed due value as one valid snapshot in both directions', async () => {
	await clear();
	const store = createTestStore({
		elements: [
			createElement(ElementType.Timer, {
				id: 'timer-1',
				properties: {
					dueDateType: DueDateType.Milliseconds,
					startDue: { kind: 'literal', type: 'number', value: 500 },
					intervalDuration: { kind: 'literal', type: 'number', value: -1 },
				},
			}),
		],
	});
	store.getState().setSelectElements(['timer-1']);
	renderProperties(store);
	const repository = new DiagramRepository();
	const errors = vi.fn();
	const saved = vi.fn();
	const save = vi.fn((data) => repository.save(data).then(() => undefined));
	const unsubscribe = subscribeDiagramPersistence(store, errors, { save, onSaved: saved });
	try {
		for (const [label, dueDateType, type] of [
			['Date', DueDateType.Date, 'date'],
			['Milliseconds', DueDateType.Milliseconds, 'number'],
		] as const) {
			fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Due date type' }));
			fireEvent.click(screen.getByRole('option', { name: label }));
			await waitFor(() => expect(saved).toHaveBeenCalledTimes(1));
			expect(save).toHaveBeenCalledTimes(1);
			expect(errors).not.toHaveBeenCalled();
			const loaded = await new DiagramRepository().load();
			expect(loaded?.diagram.elements[0].properties).toMatchObject({
				dueDateType,
				startDue: { kind: 'literal', type },
				intervalDuration: { kind: 'literal', type: 'number', value: -1 },
			});
			saved.mockClear();
			save.mockClear();
		}
	} finally {
		unsubscribe();
		cleanup();
	}
});
