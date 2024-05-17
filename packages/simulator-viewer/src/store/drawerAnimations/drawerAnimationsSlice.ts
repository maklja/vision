import { v1 } from 'uuid';
import { StateCreator } from 'zustand';
import { AnimationKey } from '../../animation';
import { RootState } from '../rootStore';
import { ObservableEvent } from '../simulation';
import { updateElement } from '../elements';

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
		.flatMap((eventQueue) => {
			const nextAnimation = eventQueue[0];
			const sameAnimations = [nextAnimation];
			for (const animation of eventQueue.slice(1)) {
				if (animation.key !== nextAnimation.key) {
					break;
				}

				sameAnimations.push(animation);
			}

			return sameAnimations;
		})
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

function compressAnimations(
	animations: DrawerAnimation[],
	compressNumber = 4,
	allowedAnimationCompression = [AnimationKey.HighlightDrawer],
) {
	const nextAnimation = animations[0];
	if (!allowedAnimationCompression.includes(nextAnimation.key)) {
		return animations;
	}

	const followingAnimations = animations.slice(1, compressNumber + 1);
	for (const animation of followingAnimations) {
		if (animation.key !== nextAnimation.key) {
			return animations;
		}

		console.log('disposed');
		animation.dispose = true;
	}

	return animations;
}

function scheduleSimulationAnimations(state: RootState) {
	retrieveNextAnimations(state).forEach(({ id, groupId, key, dispose, drawerId, data }) => {
		const animationExists = state.animations[drawerId]?.some((a) => a.id === id);
		if (animationExists) {
			return;
		}

		if (!state.animations[drawerId]) {
			state.animations[drawerId] = [];
			updateElement(state, {
				id: groupId,
				visible: key === AnimationKey.MoveDrawer,
			});
		}

		state.animations[drawerId].push({
			id,
			groupId,
			key,
			drawerId,
			dispose,
			data,
		});
		compressAnimations(state.animations[drawerId]);
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
		get().removeSimulationAnimation(payload.animationGroupId, payload.animationId);
		get().removeDrawerAnimation(payload);
		get().scheduleSimulationAnimations();
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

			const animation = drawerAnimations.find((animation) => animation.id === animationId);
			if (!animation) {
				return state;
			}

			animation.dispose = true;

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

