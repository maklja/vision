import { describe, expect, it } from 'vitest';
import {
	ConnectPointPosition,
	ConnectPointType,
	ElementType,
	FlowValueType,
} from '@maklja/vision-simulator-model';
import { AnimationKey } from '../../animation';
import {
	createConnectLine,
	createElement,
	createObservableEvent,
	createTestStore,
} from '../../test-utils';
import { ObservableEvent, SimulationState } from './simulationSlice';

type Store = ReturnType<typeof createTestStore>;

// Creating the root store consumes one UUID for the simulation id, so generated identifiers start
// at two for the first event/animation the simulation schedules.
function generatedUuid(counter: number) {
	return `00000000-0000-4000-8000-${String(counter).padStart(12, '0')}`;
}

// A five point line produces two movement segments between the source and target highlights.
const CONNECT_LINE_POINTS = [
	{ x: 110, y: 34 },
	{ x: 160, y: 34 },
	{ x: 210, y: 54 },
	{ x: 260, y: 54 },
	{ x: 310, y: 34 },
];

function createDiagramStore(points = CONNECT_LINE_POINTS): Store {
	return createTestStore({
		elements: [
			createElement(ElementType.Of, { id: 'of-1', x: 0, y: 0 }),
			createElement(ElementType.Map, { id: 'map-1', x: 300, y: 0 }),
		],
		connectLines: [
			createConnectLine({
				id: 'line-1',
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
				points,
			}),
		],
	});
}

function observableEvent(overrides: Partial<ObservableEvent> = {}): ObservableEvent {
	return createObservableEvent({
		id: 'event-1',
		type: FlowValueType.Next,
		connectLinesId: ['line-1'],
		sourceElementId: 'of-1',
		targetElementId: 'map-1',
		...overrides,
	});
}

function queueOf(store: Store, groupId: string) {
	return store.getState().simulation.animations.queue[groupId];
}

function destroyLeadingAnimation(store: Store, groupId: string) {
	const [animation] = queueOf(store, groupId);
	store.getState().destroyDrawerAnimation({
		drawerId: animation.drawerId,
		animationId: animation.id,
		animationGroupId: groupId,
	});
}

function drainQueue(store: Store, groupId: string) {
	while (queueOf(store, groupId)?.length) {
		destroyLeadingAnimation(store, groupId);
	}
}

describe('simulation slice', () => {
	it('starts stopped with deterministic empty bookkeeping', () => {
		const store = createTestStore();
		const { simulation } = store.getState();

		expect(simulation.id).toBe(generatedUuid(1));
		expect(simulation.state).toBe(SimulationState.Stopped);
		expect(simulation.completed).toBe(false);
		expect(simulation.events).toEqual([]);
		expect(simulation.animations).toEqual({ queue: {}, subscribed: [], completed: [] });
	});

	describe('lifecycle', () => {
		it('ignores observable events while stopped', () => {
			const store = createDiagramStore();

			store.getState().simulateObservableEvent(observableEvent());

			expect(store.getState().simulation.events).toEqual([]);
			expect(store.getState().simulation.animations.queue).toEqual({});
			expect(store.getState().elements['event-1']).toBeUndefined();
		});

		it('clears events, queues and subscription bookkeeping on restart', () => {
			const store = createDiagramStore();
			store.getState().startSimulation();
			store
				.getState()
				.simulateObservableEvent(
					observableEvent({ id: 'sub-1', type: FlowValueType.Subscribe }),
				);
			drainQueue(store, 'sub-1');

			expect(store.getState().simulation.animations.subscribed).toEqual(['sub-1']);

			store.getState().simulateObservableEvent(observableEvent({ id: 'next-1' }));
			store.getState().startSimulation();

			expect(store.getState().simulation.events).toEqual([]);
			expect(store.getState().simulation.animations).toEqual({
				queue: {},
				subscribed: [],
				completed: [],
			});
			expect(store.getState().simulation.state).toBe(SimulationState.Running);
			expect(store.getState().simulation.completed).toBe(false);
		});

		it('stays running while animations are pending and stops after the final one', () => {
			const store = createDiagramStore();
			store.getState().startSimulation();
			store.getState().simulateObservableEvent(observableEvent());

			store.getState().completeSimulation();

			expect(store.getState().simulation.completed).toBe(true);
			expect(store.getState().simulation.state).toBe(SimulationState.Running);

			drainQueue(store, 'event-1');

			expect(store.getState().simulation.state).toBe(SimulationState.Stopped);
			expect(store.getState().simulation.animations.queue).toEqual({});
		});

		it('completes immediately when nothing is queued', () => {
			const store = createDiagramStore();
			store.getState().startSimulation();

			store.getState().completeSimulation();

			expect(store.getState().simulation.completed).toBe(true);
			expect(store.getState().simulation.state).toBe(SimulationState.Stopped);
		});

		it('resets a run without deleting diagram elements', () => {
			const store = createDiagramStore();
			store.getState().startSimulation();
			store.getState().simulateObservableEvent(observableEvent());

			store.getState().resetSimulation();

			expect(store.getState().elements['event-1']).toBeUndefined();
			expect(store.getState().elements['of-1']).toBeDefined();
			expect(store.getState().elements['map-1']).toBeDefined();
			expect(store.getState().simulation.state).toBe(SimulationState.Stopped);
			expect(store.getState().simulation.completed).toBe(false);
			expect(store.getState().simulation.events).toEqual([]);
			expect(store.getState().simulation.animations).toEqual({
				queue: {},
				subscribed: [],
				completed: [],
			});
		});

		it('starts a fresh run after a reset', () => {
			const store = createDiagramStore();
			store.getState().startSimulation();
			store.getState().simulateObservableEvent(observableEvent());
			store.getState().resetSimulation();

			store.getState().startSimulation();
			store.getState().simulateObservableEvent(observableEvent({ id: 'event-2' }));

			expect(store.getState().simulation.events.map((event) => event.id)).toEqual([
				'event-2',
			]);
			expect(store.getState().simulation.state).toBe(SimulationState.Running);
			expect(store.getState().elements['event-1']).toBeUndefined();
			expect(store.getState().elements['event-2']).toBeDefined();
		});
	});

	describe('events and result elements', () => {
		it('stores events in arrival order with deterministic source, segment and target animations', () => {
			const store = createDiagramStore();
			store.getState().startSimulation();

			store.getState().simulateObservableEvent(observableEvent({ id: 'next-1' }));
			store.getState().simulateObservableEvent(observableEvent({ id: 'next-2' }));

			expect(store.getState().simulation.events.map((event) => event.id)).toEqual([
				'next-1',
				'next-2',
			]);

			const animations = queueOf(store, 'next-1');
			expect(animations.map((animation) => animation.key)).toEqual([
				AnimationKey.HighlightDrawer,
				AnimationKey.MoveDrawer,
				AnimationKey.MoveDrawer,
				AnimationKey.HighlightDrawer,
			]);
			expect(animations.map((animation) => animation.drawerId)).toEqual([
				'of-1',
				'next-1',
				'next-1',
				'map-1',
			]);
			expect(animations.every((animation) => animation.groupId === 'next-1')).toBe(true);
			// The source highlight is generated after the movement and target animations but is
			// returned first, so its deterministic identifier is the highest of the group.
			expect(animations.map((animation) => animation.id)).toEqual([
				generatedUuid(5),
				generatedUuid(2),
				generatedUuid(3),
				generatedUuid(4),
			]);
		});

		it('records next, subscribe, complete and error events in order and tracks completion', () => {
			const store = createDiagramStore();
			store.getState().startSimulation();

			store
				.getState()
				.simulateObservableEvent(
					observableEvent({ id: 'next-1', type: FlowValueType.Next }),
				);
			expect(store.getState().simulation.completed).toBe(false);

			store
				.getState()
				.simulateObservableEvent(
					observableEvent({ id: 'subscribe-1', type: FlowValueType.Subscribe }),
				);
			store
				.getState()
				.simulateObservableEvent(
					observableEvent({ id: 'complete-1', type: FlowValueType.Complete }),
				);
			store
				.getState()
				.simulateObservableEvent(
					observableEvent({ id: 'error-1', type: FlowValueType.Error, value: 'boom' }),
				);

			expect(
				store.getState().simulation.events.map((event) => [event.id, event.type]),
			).toEqual([
				['next-1', FlowValueType.Next],
				['subscribe-1', FlowValueType.Subscribe],
				['complete-1', FlowValueType.Complete],
				['error-1', FlowValueType.Error],
			]);
			expect(store.getState().simulation.completed).toBe(true);
		});

		it('selects the error animation for error events and highlight animations otherwise', () => {
			const store = createDiagramStore();
			store.getState().startSimulation();
			store
				.getState()
				.simulateObservableEvent(
					observableEvent({ id: 'complete-1', type: FlowValueType.Complete }),
				);
			store
				.getState()
				.simulateObservableEvent(
					observableEvent({ id: 'error-1', type: FlowValueType.Error }),
				);

			const endpointKeys = (groupId: string) =>
				new Set(
					queueOf(store, groupId)
						.filter((animation) => animation.drawerId !== groupId)
						.map((animation) => animation.key),
				);

			expect([...endpointKeys('complete-1')]).toEqual([AnimationKey.HighlightDrawer]);
			expect([...endpointKeys('error-1')]).toEqual([AnimationKey.ErrorDrawer]);
		});

		it('creates the result element at the first segment endpoint with hash and hidden visibility', () => {
			const store = createDiagramStore();
			store.getState().startSimulation();

			store.getState().simulateObservableEvent(observableEvent({ hash: 'hash-1' }));

			expect(store.getState().elements['event-1']).toMatchObject({
				id: 'event-1',
				name: 'event-1',
				type: ElementType.Result,
				visible: false,
				x: 160,
				y: 34,
				properties: { hash: 'hash-1' },
			});
		});

		it('keeps the first result element when a duplicate event id arrives', () => {
			const store = createDiagramStore();
			store.getState().startSimulation();
			store.getState().createResultElement(observableEvent({ hash: 'first' }));
			const created = store.getState().elements['event-1'];

			store
				.getState()
				.createResultElement(observableEvent({ hash: 'second', connectLinesId: [] }));

			expect(store.getState().elements['event-1']).toBe(created);
			expect(store.getState().elements['event-1'].properties).toEqual({ hash: 'first' });
		});

		it('records a repeated event without duplicating its result element or scheduling it twice', () => {
			const store = createDiagramStore();
			store.getState().startSimulation();

			store.getState().simulateObservableEvent(observableEvent());
			store.getState().simulateObservableEvent(observableEvent());

			expect(store.getState().simulation.events).toHaveLength(2);
			expect(queueOf(store, 'event-1')).toHaveLength(8);
			expect(store.getState().animations['of-1']).toHaveLength(1);
		});

		it('skips result creation when the event has no resolvable connection line', () => {
			const store = createDiagramStore();
			store.getState().startSimulation();

			store
				.getState()
				.simulateObservableEvent(observableEvent({ connectLinesId: ['missing-line'] }));

			expect(store.getState().elements['event-1']).toBeUndefined();
			expect(store.getState().simulation.events).toHaveLength(1);
			expect(queueOf(store, 'event-1').map((animation) => animation.key)).toEqual([
				AnimationKey.HighlightDrawer,
				AnimationKey.HighlightDrawer,
			]);
		});

		it('removes the result element after the final animation completes', () => {
			const store = createDiagramStore();
			store.getState().startSimulation();
			store.getState().simulateObservableEvent(observableEvent());

			drainQueue(store, 'event-1');

			expect(store.getState().elements['event-1']).toBeUndefined();
		});

		it('advances the result element between segments and toggles visibility by animation type', () => {
			const store = createDiagramStore();
			store.getState().startSimulation();
			store.getState().simulateObservableEvent(observableEvent());

			expect(store.getState().animations['of-1'].map((animation) => animation.key)).toEqual([
				AnimationKey.HighlightDrawer,
			]);
			expect(store.getState().elements['event-1']).toMatchObject({
				visible: false,
				x: 160,
				y: 34,
			});

			destroyLeadingAnimation(store, 'event-1');
			expect(
				store.getState().animations['event-1'].map((animation) => animation.key),
			).toEqual([AnimationKey.MoveDrawer, AnimationKey.MoveDrawer]);
			expect(store.getState().elements['event-1']).toMatchObject({
				visible: true,
				x: 160,
				y: 34,
			});

			destroyLeadingAnimation(store, 'event-1');
			expect(store.getState().elements['event-1']).toMatchObject({ x: 210, y: 54 });

			destroyLeadingAnimation(store, 'event-1');
			expect(store.getState().animations['map-1'].map((animation) => animation.key)).toEqual([
				AnimationKey.HighlightDrawer,
			]);
			expect(store.getState().elements['event-1']).toMatchObject({ visible: false });
		});
	});

	describe('scheduling and dependencies', () => {
		it('gates events on subscription ids and releases them once subscribed', () => {
			const store = createDiagramStore();
			store.getState().startSimulation();
			store
				.getState()
				.simulateObservableEvent(observableEvent({ id: 'child-1', subscribeId: 'sub-1' }));

			expect(store.getState().animations['of-1']).toBeUndefined();

			store
				.getState()
				.simulateObservableEvent(
					observableEvent({ id: 'sub-1', type: FlowValueType.Subscribe }),
				);
			drainQueue(store, 'sub-1');

			expect(store.getState().simulation.animations.subscribed).toEqual(['sub-1']);
			expect(store.getState().animations['of-1'].map((animation) => animation.id)).toEqual([
				queueOf(store, 'child-1')[0].id,
			]);
		});

		it('gates events on completed dependencies', () => {
			const store = createDiagramStore();
			store.getState().startSimulation();
			store
				.getState()
				.simulateObservableEvent(
					observableEvent({ id: 'dependent-1', dependencies: ['dep-1'] }),
				);

			expect(store.getState().animations['of-1']).toBeUndefined();

			store.getState().simulateObservableEvent(observableEvent({ id: 'dep-1' }));
			drainQueue(store, 'dep-1');

			expect(store.getState().simulation.animations.completed).toEqual(['dep-1']);
			expect(store.getState().animations['of-1'].map((animation) => animation.id)).toEqual([
				queueOf(store, 'dependent-1')[0].id,
			]);
		});

		it('does not schedule the same animation twice', () => {
			const store = createDiagramStore();
			store.getState().startSimulation();
			store.getState().simulateObservableEvent(observableEvent());

			store.getState().scheduleSimulationAnimations();
			store.getState().scheduleSimulationAnimations();

			expect(store.getState().animations['of-1']).toHaveLength(1);
		});

		it('compresses a compatible run of highlights for the same drawer', () => {
			const store = createDiagramStore();
			store.getState().startSimulation();
			store.getState().simulateObservableEvent(observableEvent({ id: 'a' }));
			store.getState().simulateObservableEvent(observableEvent({ id: 'b' }));

			const highlights = store.getState().animations['of-1'];
			expect(highlights).toHaveLength(2);
			expect(highlights[0].dispose).toBe(false);
			expect(highlights[1].dispose).toBe(true);
		});
	});

	describe('error animations', () => {
		it('creates the element error from an error animation', () => {
			const store = createDiagramStore();
			store.getState().startSimulation();
			store
				.getState()
				.simulateObservableEvent(
					observableEvent({ id: 'error-1', type: FlowValueType.Error, value: 'boom' }),
				);

			destroyLeadingAnimation(store, 'error-1');
			destroyLeadingAnimation(store, 'error-1');

			expect(store.getState().errors).toEqual({
				'of-1': { errorId: 'error-1', errorMessage: 'boom' },
			});
		});

		it('clears a recorded error on later non-error progress', () => {
			const store = createDiagramStore();
			store.getState().startSimulation();
			store
				.getState()
				.simulateObservableEvent(
					observableEvent({ id: 'error-1', type: FlowValueType.Error, value: 'boom' }),
				);
			destroyLeadingAnimation(store, 'error-1');
			destroyLeadingAnimation(store, 'error-1');
			expect(store.getState().errors['of-1']).toEqual({
				errorId: 'error-1',
				errorMessage: 'boom',
			});

			store.getState().simulateObservableEvent(observableEvent({ id: 'next-1' }));
			destroyLeadingAnimation(store, 'next-1');

			expect(store.getState().errors).toEqual({});
		});
	});
});
