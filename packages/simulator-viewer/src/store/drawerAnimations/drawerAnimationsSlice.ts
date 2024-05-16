import { v1 } from 'uuid';
import { StateCreator } from 'zustand';
import { AnimationKey } from '../../animation';
import { RootState } from '../rootStore';
import { ObservableEvent } from '../simulation';

export interface DestroyDrawerAnimationPayload {
	drawerId: string;
	animationId: string;
	animationGroupId: string;
}

export interface DisposeDrawerAnimationPayload {
	drawerId: string;
	animationId: string;
}

export interface RefreshDrawerAnimationPayload {
	drawerId: string;
	key: AnimationKey;
}

export interface DrawerAnimation<D = unknown> {
	readonly id: string;
	readonly key: AnimationKey;
	readonly drawerId: string;
	readonly groupId: string;
	dispose: boolean;
	data?: D;
}

export interface AnimationSlice {
	animations: Record<string, DrawerAnimation[]>;
	destroyDrawerAnimation: (payload: DestroyDrawerAnimationPayload) => void;
	removeAllDrawerAnimations: (drawerId: string) => void;
	disposeDrawerAnimation: (payload: DisposeDrawerAnimationPayload) => void;
	refreshDrawerAnimation: (payload: RefreshDrawerAnimationPayload) => void;
	scheduleSimulationAnimations: () => void;
	removeDrawerAnimation: (payload: DestroyDrawerAnimationPayload) => void;
}

const SUPPORTED_ANIMATIONS: readonly AnimationKey[] = [
	AnimationKey.MoveDrawer,
	AnimationKey.HighlightDrawer,
	AnimationKey.ErrorDrawer,
];

export function retrieveNextAnimations(state: RootState) {
	const { simulation } = state;
	return Object.values(simulation.animations.queue)
		.map((eventQueue) => eventQueue[0])
		.filter((animation) => {
			if (!animation || !SUPPORTED_ANIMATIONS.includes(animation.key)) {
				return false;
			}

			const animationData = animation.data as ObservableEvent;
			if (!animationData.subscribeId) {
				return true;
			}

			return simulation.animations.subscribed.includes(animationData.subscribeId);
		});
}

function scheduleSimulationAnimations(state: RootState) {
	retrieveNextAnimations(state).forEach(({ id, groupId, key, dispose, drawerId, data }) => {
		const drawerAnimations = state.animations[drawerId];
		const newAnimation = {
			id,
			groupId,
			key,
			drawerId,
			dispose,
			data,
		};

		if (!drawerAnimations) {
			state.animations[drawerId] = [newAnimation];
			return;
		}

		const animationExists = drawerAnimations.some((a) => a.id === newAnimation.id);
		if (animationExists) {
			return;
		}

		state.animations[drawerId].push(newAnimation);
	});

	return state;
}

export const createAnimationSlice: StateCreator<RootState, [], [], AnimationSlice> = (
	set,
	get,
) => ({
	animations: {},
	scheduleSimulationAnimations: () => set((state) => scheduleSimulationAnimations(state), true),
	removeDrawerAnimation: (payload: DestroyDrawerAnimationPayload) =>
		set((state) => {
			const { animationId, drawerId } = payload;

			const drawerAnimations = state.animations[drawerId];
			if (!drawerAnimations) {
				return state;
			}

			const animationIdx = drawerAnimations.findIndex((a) => a.id === animationId);
			if (animationIdx === -1) {
				return state;
			}

			drawerAnimations.splice(animationIdx, 1);
			if (drawerAnimations.length === 0) {
				delete state.animations[drawerId];
			}

			return state;
		}, true),
	destroyDrawerAnimation: (payload: DestroyDrawerAnimationPayload) => {
		get().removeDrawerAnimation(payload);
		get().removeSimulationAnimation(payload.animationGroupId, payload.animationId);
	},
	removeAllDrawerAnimations: (drawerId: string) =>
		set((state) => {
			delete state.animations[drawerId];

			return state;
		}, true),
	disposeDrawerAnimation: (payload: DisposeDrawerAnimationPayload) =>
		set((state) => {
			const { drawerId, animationId } = payload;
			const drawerAnimations = state.animations[drawerId];
			if (!drawerAnimations) {
				return state;
			}

			const updatedQueue = drawerAnimations.map((a) =>
				a.id === animationId
					? {
							...a,
							dispose: true,
						}
					: a,
			);
			state.animations[drawerId] = updatedQueue;

			return state;
		}, true),
	refreshDrawerAnimation: (payload: RefreshDrawerAnimationPayload) =>
		set((state) => {
			const { drawerId, key } = payload;
			const drawerAnimations = state.animations[drawerId];
			const id = v1();
			if (!drawerAnimations) {
				state.animations[drawerId] = [
					{
						id,
						groupId: id,
						key,
						drawerId,
						dispose: false,
					},
				];
				return state;
			}

			const [currentAnimation] = drawerAnimations;
			if (currentAnimation.key === key) {
				const [, ...otherAnimations] = drawerAnimations;
				state.animations[drawerId] = [
					{ ...currentAnimation, dispose: false },
					...otherAnimations,
				];
				return state;
			}

			state.animations[drawerId] = [
				...drawerAnimations,
				{
					id: id,
					groupId: id,
					key,
					drawerId,
					dispose: false,
				},
			];

			return state;
		}, true),
});

export const selectDrawerAnimationByDrawerId =
	(drawerId: string) =>
	(state: RootState): DrawerAnimation | null =>
		state.animations[drawerId]?.at(0) ?? null;

