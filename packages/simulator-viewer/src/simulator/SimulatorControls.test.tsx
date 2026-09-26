// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	ConnectPointPosition,
	ConnectPointType,
	ElementType,
	FlowValueType,
} from '@maklja/vision-simulator-model';
import type { FlowValueEvent } from '@maklja/vision-simulator-engine';
import {
	createConnectLine,
	createElement,
	createObservableEvent,
	createStoreWrapper,
	createTestStore,
} from '../test-utils';
import { SimulationState } from '../store/simulation';
import { SimulatorControls } from './SimulatorControls';

const engine = vi.hoisted(() => ({
	startObservableSimulation: vi.fn(),
}));

// The store-connected controls dynamically import the engine. Replacing it keeps the subscription
// lifecycle deterministic and lets tests drive next, error, complete and creation-error callbacks.
vi.mock('@maklja/vision-simulator-engine', () => engine);

type StageProp = Parameters<typeof SimulatorControls>[0]['stage'];

function createSubscription() {
	return { unsubscribe: vi.fn(), closed: false };
}

function createStageMock() {
	const position = vi.fn();
	const scale = vi.fn();
	const stage = {
		width: () => 800,
		height: () => 600,
		position,
		scale,
		scaleX: () => 1,
		scaleY: () => 1,
	} as unknown as StageProp;

	return { stage, position, scale };
}

function createGraph() {
	return {
		elements: [
			createElement(ElementType.Of, { id: 'of-1', name: 'zeta', x: 0, y: 0 }),
			createElement(ElementType.Map, { id: 'map-1', name: 'middle', x: 200, y: 0 }),
			createElement(ElementType.Subscriber, { id: 'subscriber-1', name: 'sink', x: 400, y: 0 }),
			createElement(ElementType.Interval, { id: 'interval-1', name: 'alpha', x: 0, y: 200 }),
			createElement(ElementType.Merge, { id: 'merge-1', name: 'beta', x: 0, y: 400 }),
		],
		connectLines: [
			createConnectLine({
				id: 'cl-1',
				source: {
					id: 'of-1',
					connectPointType: ConnectPointType.Output,
					connectPosition: ConnectPointPosition.Right,
				},
				target: {
					id: 'map-1',
					connectPointType: ConnectPointType.Input,
					connectPosition: ConnectPointPosition.Left,
				},
			}),
			createConnectLine({
				id: 'cl-2',
				source: {
					id: 'map-1',
					connectPointType: ConnectPointType.Output,
					connectPosition: ConnectPointPosition.Right,
				},
				target: {
					id: 'subscriber-1',
					connectPointType: ConnectPointType.Input,
					connectPosition: ConnectPointPosition.Left,
				},
			}),
		],
	};
}

function renderControls(stage: StageProp = null) {
	const graph = createGraph();
	const store = createTestStore(graph);
	const Wrapper = createStoreWrapper(store);
	render(
		<Wrapper>
			<SimulatorControls stage={stage} />
		</Wrapper>,
	);

	function openOptions() {
		fireEvent.mouseDown(screen.getByRole('combobox'));
		return screen.getAllByRole('option');
	}

	function selectEntryOption(label: string) {
		const option = openOptions().find((el) => el.textContent?.includes(label));
		if (!option) {
			throw new Error(`Entry option ${label} not found`);
		}
		fireEvent.click(option);
	}

	async function startSimulation(label: string) {
		selectEntryOption(label);
		await act(async () => {
			fireEvent.click(screen.getByRole('button', { name: 'start simulation' }));
		});
	}

	return { store, openOptions, selectEntryOption, startSimulation };
}

function startCallbacks(callIndex = 0) {
	return engine.startObservableSimulation.mock.calls[callIndex][0] as {
		entryElementId: string;
		elements: { id: string }[];
		connectLines: { id: string }[];
		onNext: (event: FlowValueEvent) => void;
		onError: (event: FlowValueEvent) => void;
		onComplete: () => void;
		onCreationError: (event: { elementId: string; errorId: string; errorMessage: string }) => void;
	};
}

describe('SimulatorControls', () => {
	let subscription: ReturnType<typeof createSubscription>;

	beforeEach(() => {
		subscription = createSubscription();
		engine.startObservableSimulation.mockReset();
		engine.startObservableSimulation.mockImplementation(() => subscription);
	});

	afterEach(() => {
		cleanup();
	});

	it('offers only entry-capable operators, sorted by name', () => {
		const { openOptions } = renderControls();

		const optionLabels = openOptions().map((option) => option.textContent);

		expect(optionLabels).toEqual(['interval - alpha', 'merge - beta', 'of - zeta']);
	});

	it('clears errors and the current selection, then subscribes with the current graph', async () => {
		const { store, startSimulation } = renderControls();

		store.getState().createElementError({
			elementId: 'of-1',
			errorId: 'error-1',
			errorMessage: 'boom',
		});
		store.getState().setSelectElements(['map-1', 'subscriber-1']);

		await startSimulation('of - zeta');

		expect(store.getState().errors).toEqual({});
		expect(store.getState().selectedElements).toEqual([]);
		expect(store.getState().simulation.state).toBe(SimulationState.Running);
		expect(store.getState().simulation.events).toEqual([]);

		expect(engine.startObservableSimulation).toHaveBeenCalledTimes(1);
		const call = startCallbacks();
		expect(call.entryElementId).toBe('of-1');
		expect(call.elements.map((el) => el.id)).toEqual([
			'of-1',
			'map-1',
			'subscriber-1',
			'interval-1',
			'merge-1',
		]);
		expect(call.connectLines.map((cl) => cl.id)).toEqual(['cl-1', 'cl-2']);
		for (const callback of ['onNext', 'onError', 'onComplete', 'onCreationError']) {
			expect(typeof (call as unknown as Record<string, unknown>)[callback]).toBe('function');
		}
	});

	it('queues engine next events and creates the transient result element', async () => {
		const { store, startSimulation } = renderControls();
		await startSimulation('of - zeta');

		const event = createObservableEvent({
			id: 'event-1',
			type: FlowValueType.Next,
			connectLinesId: ['cl-1'],
			sourceElementId: 'of-1',
			targetElementId: 'map-1',
			value: '42',
		});
		act(() => {
			startCallbacks().onNext(event as unknown as FlowValueEvent);
		});

		expect(store.getState().simulation.events).toHaveLength(1);
		expect(store.getState().simulation.events[0]).toEqual({
			...event,
			connectLinesId: ['cl-1'],
			dependencies: [],
		});
		expect(store.getState().simulation.animations.queue['event-1']).toBeDefined();
		expect(store.getState().elements['event-1']).toBeDefined();
		expect(store.getState().elements['event-1'].type).toBe(ElementType.Result);
	});

	it('unsubscribes exactly once when the engine completes', async () => {
		const { store, startSimulation } = renderControls();
		await startSimulation('of - zeta');

		act(() => {
			startCallbacks().onComplete();
		});

		expect(subscription.unsubscribe).toHaveBeenCalledTimes(1);
		expect(store.getState().simulation.completed).toBe(true);
	});

	it('dispatches a runtime error event and unsubscribes exactly once', async () => {
		const { store, startSimulation } = renderControls();
		await startSimulation('of - zeta');

		const errorEvent = createObservableEvent({
			id: 'error-event',
			type: FlowValueType.Error,
			connectLinesId: ['cl-1'],
			sourceElementId: 'of-1',
			targetElementId: 'map-1',
			value: 'kaboom',
		});
		act(() => {
			startCallbacks().onError(errorEvent as unknown as FlowValueEvent);
		});

		expect(store.getState().simulation.events[0].type).toBe(FlowValueType.Error);
		expect(subscription.unsubscribe).toHaveBeenCalledTimes(1);
	});

	it('resets the simulation and attaches a creation error to the responsible element', async () => {
		const { store, startSimulation } = renderControls();
		await startSimulation('of - zeta');

		act(() => {
			startCallbacks().onCreationError({
				elementId: 'map-1',
				errorId: 'creation-error',
				errorMessage: 'Cannot create the observable',
			});
		});

		expect(subscription.unsubscribe).toHaveBeenCalledTimes(1);
		expect(store.getState().simulation.state).toBe(SimulationState.Stopped);
		expect(store.getState().simulation.events).toEqual([]);
		expect(store.getState().errors).toEqual({
			'map-1': { errorId: 'creation-error', errorMessage: 'Cannot create the observable' },
		});
	});

	it('stops a running simulation by unsubscribing exactly once', async () => {
		const { store, startSimulation } = renderControls();
		await startSimulation('of - zeta');

		await act(async () => {
			fireEvent.click(screen.getByRole('button', { name: 'stop simulation' }));
		});

		expect(subscription.unsubscribe).toHaveBeenCalledTimes(1);
		expect(store.getState().simulation.state).toBe(SimulationState.Stopped);
		expect(engine.startObservableSimulation).toHaveBeenCalledTimes(1);
	});

	it('resets by unsubscribing once and starting a fresh subscription for the same entry', async () => {
		const { startSimulation } = renderControls();
		await startSimulation('of - zeta');

		const secondSubscription = createSubscription();
		engine.startObservableSimulation.mockImplementation(() => secondSubscription);

		await act(async () => {
			fireEvent.click(screen.getByRole('button', { name: 'reset simulation' }));
		});

		expect(subscription.unsubscribe).toHaveBeenCalledTimes(1);
		expect(engine.startObservableSimulation).toHaveBeenCalledTimes(2);
		expect(startCallbacks(0).entryElementId).toBe('of-1');
		expect(startCallbacks(1).entryElementId).toBe('of-1');

		await act(async () => {
			fireEvent.click(screen.getByRole('button', { name: 'reset simulation' }));
		});

		expect(secondSubscription.unsubscribe).toHaveBeenCalledTimes(1);
		expect(subscription.unsubscribe).toHaveBeenCalledTimes(1);
		expect(engine.startObservableSimulation).toHaveBeenCalledTimes(3);
	});

	it('centers the stage on the located element and updates the canvas and selection state', () => {
		const { stage, position, scale } = createStageMock();
		const { store, openOptions } = renderControls(stage);
		store.getState().setSelectElements(['map-1']);

		const option = openOptions().find((el) => el.textContent?.includes('of - zeta'));
		const locateButton = option?.querySelector('button');
		fireEvent.click(locateButton as HTMLButtonElement);

		expect(scale).toHaveBeenCalledWith({ x: 1, y: 1 });
		expect(position).toHaveBeenCalledWith({ x: 350, y: 250 });
		expect(store.getState().canvasState).toMatchObject({
			x: 350,
			y: 250,
			scaleX: 1,
			scaleY: 1,
		});
		expect(store.getState().selectedElements).toEqual(['of-1']);
	});

	it('ignores locate requests without a stage', () => {
		const { store, openOptions } = renderControls(null);
		store.getState().setSelectElements(['map-1']);

		const option = openOptions().find((el) => el.textContent?.includes('of - zeta'));
		fireEvent.click(option?.querySelector('button') as HTMLButtonElement);

		expect(store.getState().selectedElements).toEqual(['map-1']);
	});
});
