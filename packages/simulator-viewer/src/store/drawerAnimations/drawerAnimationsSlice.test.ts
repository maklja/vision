import { beforeEach, describe, expect, it } from 'vitest';
import { ElementType, FlowValueType } from '@maklja/vision-simulator-model';
import { AnimationKey } from '../../animation';
import { createElement, createObservableEvent, createTestStore } from '../../test-utils';
import {
	DrawerAnimation as DrawerAnimationType,
	retrieveNextAnimations,
	selectDrawerAnimationByDrawerId,
} from './drawerAnimationsSlice';
import {
	ObservableEvent,
	Simulation,
	SimulationSlice,
	SimulationState,
} from '../simulation';

type Store = ReturnType<typeof createTestStore>;

function animation(
	id: string,
	overrides: Partial<DrawerAnimationType<ObservableEvent>> = {},
): DrawerAnimationType<ObservableEvent> {
	return {
		id,
		groupId: overrides.groupId ?? 'group-1',
		drawerId: overrides.drawerId ?? 'drawer-1',
		key: overrides.key ?? AnimationKey.HighlightDrawer,
		dispose: overrides.dispose ?? false,
		data:
			overrides.data ??
			createObservableEvent({ id: `event-${id}`, subscribeId: null, dependencies: [] }),
	};
}

function setSimulation(
	store: Store,
	animations: {
		queue: Record<string, DrawerAnimationType<unknown>[]>;
		subscribed?: string[];
		completed?: string[];
	},
	completed = false,
) {
	const simulation: Simulation = {
		id: 'simulation',
		state: SimulationState.Running,
		completed,
		events: [],
		animations: {
			queue: animations.queue,
			subscribed: animations.subscribed ?? [],
			completed: animations.completed ?? [],
		},
	};
	store.setState({ simulation } as Partial<SimulationSlice>);
}

describe('drawer animation slice', () => {
	it('starts with no animations', () => {
		const store = createTestStore();

		expect(store.getState().animations).toEqual({});
		expect(selectDrawerAnimationByDrawerId('drawer-1')(store.getState())).toBeNull();
	});

	describe('retrieveNextAnimations', () => {
		it('returns a single leading run of same-key animations per event', () => {
			const store = createTestStore();
			setSimulation(store, {
				queue: {
					event: [
						animation('a', { drawerId: 'drawer-1' }),
						animation('b', { drawerId: 'drawer-2' }),
						animation('c', { drawerId: 'drawer-3', key: AnimationKey.MoveDrawer }),
					],
				},
			});

			expect(retrieveNextAnimations(store.getState()).map((a) => a.id)).toEqual(['a', 'b']);
		});

		it('skips events that are not yet subscribed or whose dependencies are incomplete', () => {
			const store = createTestStore();
			setSimulation(store, {
				queue: {
					ready: [
						animation('ready', {
							data: createObservableEvent({ subscribeId: 'sub-1', dependencies: [] }),
						}),
					],
					waitingSubscription: [
						animation('waiting', {
							data: createObservableEvent({ subscribeId: 'sub-2', dependencies: [] }),
						}),
					],
					waitingDependency: [
						animation('dependent', {
							data: createObservableEvent({
								subscribeId: null,
								dependencies: ['dep-1'],
							}),
						}),
					],
				},
				subscribed: ['sub-1'],
			});

			expect(retrieveNextAnimations(store.getState()).map((a) => a.id)).toEqual(['ready']);
		});

		it('releases animations once their subscription and dependencies complete', () => {
			const store = createTestStore();
			setSimulation(store, {
				queue: {
					ready: [
						animation('ready', {
							data: createObservableEvent({
								subscribeId: 'sub-1',
								dependencies: ['dep-1'],
							}),
						}),
					],
				},
				subscribed: ['sub-1'],
				completed: ['dep-1'],
			});

			expect(retrieveNextAnimations(store.getState()).map((a) => a.id)).toEqual(['ready']);
		});

		it('filters out unsupported animation keys', () => {
			const store = createTestStore();
			setSimulation(store, {
				queue: {
					event: [animation('snap', { key: AnimationKey.SnapConnectPoint })],
				},
			});

			expect(retrieveNextAnimations(store.getState())).toEqual([]);
		});
	});

	describe('scheduleSimulationAnimations', () => {
		it('moves eligible animations into per-drawer state', () => {
			const store = createTestStore();
			setSimulation(store, {
				queue: { event: [animation('a', { drawerId: 'drawer-1' })] },
			});

			store.getState().scheduleSimulationAnimations();

			expect(store.getState().animations['drawer-1'].map((a) => a.id)).toEqual(['a']);
			expect(store.getState().simulation.animations.queue.event).toHaveLength(1);
		});

		it('does not schedule the same animation twice', () => {
			const store = createTestStore();
			setSimulation(store, {
				queue: { event: [animation('a', { drawerId: 'drawer-1' })] },
			});

			store.getState().scheduleSimulationAnimations();
			store.getState().scheduleSimulationAnimations();

			expect(store.getState().animations['drawer-1']).toHaveLength(1);
		});

		it('compresses a run of highlight animations for the same drawer', () => {
			const store = createTestStore();
			setSimulation(store, {
				queue: {
					eventA: [animation('a', { drawerId: 'drawer-1' })],
					eventB: [animation('b', { drawerId: 'drawer-1' })],
				},
			});

			store.getState().scheduleSimulationAnimations();

			const scheduled = store.getState().animations['drawer-1'];
			expect(scheduled.map((a) => a.id)).toEqual(['a', 'b']);
			expect(scheduled[0].dispose).toBe(false);
			expect(scheduled[1].dispose).toBe(true);
		});

		it('reveals the result element for a move animation', () => {
			const store = createTestStore();
			store
				.getState()
				.addElement(createElement(ElementType.Result, { id: 'group-1', visible: false }));
			setSimulation(store, {
				queue: {
					event: [animation('a', { drawerId: 'group-1', key: AnimationKey.MoveDrawer })],
				},
			});

			store.getState().scheduleSimulationAnimations();

			expect(store.getState().elements['group-1'].visible).toBe(true);
		});
	});

	describe('drawer animation mutations', () => {
		let store: Store;

		beforeEach(() => {
			store = createTestStore();
		});

		it('removes a single drawer animation and its empty drawer key', () => {
			store.getState().refreshDrawerAnimation({
				drawerId: 'drawer-1',
				key: AnimationKey.HighlightDrawer,
			});
			const animationId = store.getState().animations['drawer-1'][0].id;

			store.getState().removeDrawerAnimation({
				drawerId: 'drawer-1',
				animationId,
				animationGroupId: 'group-1',
			});

			expect(store.getState().animations['drawer-1']).toBeUndefined();
		});

		it('ignores removing unknown drawer animations', () => {
			store.getState().refreshDrawerAnimation({
				drawerId: 'drawer-1',
				key: AnimationKey.HighlightDrawer,
			});
			const before = store.getState().animations['drawer-1'];

			store.getState().removeDrawerAnimation({
				drawerId: 'drawer-1',
				animationId: 'missing',
				animationGroupId: 'group-1',
			});
			store.getState().removeDrawerAnimation({
				drawerId: 'missing',
				animationId: 'missing',
				animationGroupId: 'group-1',
			});

			expect(store.getState().animations['drawer-1']).toBe(before);
		});

		it('disposes a drawer animation by id', () => {
			store.getState().refreshDrawerAnimation({
				drawerId: 'drawer-1',
				key: AnimationKey.HighlightDrawer,
			});
			const animationId = store.getState().animations['drawer-1'][0].id;

			store.getState().disposeDrawerAnimation({ drawerId: 'drawer-1', animationId });

			expect(store.getState().animations['drawer-1'][0].dispose).toBe(true);
		});

		it('ignores disposing unknown drawer animations', () => {
			const before = store.getState().animations;

			store.getState().disposeDrawerAnimation({ drawerId: 'missing', animationId: 'missing' });

			expect(store.getState().animations).toBe(before);
		});

		it('removes every drawer animation for a drawer', () => {
			store.getState().refreshDrawerAnimation({
				drawerId: 'drawer-1',
				key: AnimationKey.HighlightDrawer,
			});

			store.getState().removeAllDrawerAnimations('drawer-1');

			expect(store.getState().animations['drawer-1']).toBeUndefined();
		});

		it('creates, reuses and appends drawer animations on refresh', () => {
			store.getState().refreshDrawerAnimation({
				drawerId: 'drawer-1',
				key: AnimationKey.HighlightDrawer,
			});
			expect(store.getState().animations['drawer-1']).toHaveLength(1);

			store.getState().disposeDrawerAnimation({
				drawerId: 'drawer-1',
				animationId: store.getState().animations['drawer-1'][0].id,
			});
			const reusedId = store.getState().animations['drawer-1'][0].id;

			store.getState().refreshDrawerAnimation({
				drawerId: 'drawer-1',
				key: AnimationKey.HighlightDrawer,
			});

			const reused = store.getState().animations['drawer-1'];
			expect(reused).toHaveLength(1);
			expect(reused[0].id).toBe(reusedId);
			expect(reused[0].dispose).toBe(false);

			store.getState().refreshDrawerAnimation({
				drawerId: 'drawer-1',
				key: AnimationKey.MoveDrawer,
			});
			expect(store.getState().animations['drawer-1']).toHaveLength(2);
			expect(store.getState().animations['drawer-1'][1].key).toBe(AnimationKey.MoveDrawer);
		});
	});

	describe('destroyDrawerAnimation orchestration', () => {
		it('reports an element error for an error event and clears it for other events', () => {
			const store = createTestStore();
			const errorAnimation = animation('error', {
				drawerId: 'error-event',
				groupId: 'error-event',
				key: AnimationKey.ErrorDrawer,
				data: createObservableEvent({
					id: 'error-event',
					type: FlowValueType.Error,
					value: 'boom',
					sourceElementId: 'of-1',
				}),
			});
			setSimulation(store, { queue: { 'error-event': [errorAnimation] } });
			store.getState().scheduleSimulationAnimations();

			store.getState().destroyDrawerAnimation({
				drawerId: 'error-event',
				animationId: 'error',
				animationGroupId: 'error-event',
			});

			expect(store.getState().errors['of-1']).toEqual({
				errorId: 'error-event',
				errorMessage: 'boom',
			});
			expect(store.getState().animations['error-event']).toBeUndefined();
		});

		it('clears errors for a non-error event', () => {
			const store = createTestStore();
			store.getState().createElementError({
				elementId: 'of-1',
				errorId: 'previous',
				errorMessage: 'previous',
			});
			const nextAnimation = animation('next', {
				drawerId: 'next-event',
				groupId: 'next-event',
				data: createObservableEvent({ id: 'next-event', type: FlowValueType.Next }),
			});
			setSimulation(store, { queue: { 'next-event': [nextAnimation] } });
			store.getState().scheduleSimulationAnimations();

			store.getState().destroyDrawerAnimation({
				drawerId: 'next-event',
				animationId: 'next',
				animationGroupId: 'next-event',
			});

			expect(store.getState().errors).toEqual({});
		});
	});
});
