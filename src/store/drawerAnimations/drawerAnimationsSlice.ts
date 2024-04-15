import { v1 } from 'uuid';
import { StateCreator } from 'zustand';
import { AnimationKey } from '../../animation';
import { RootStore } from '../rootStore';

export interface AddDrawerAnimationActionPayload {
	drawerId: string;
	key: AnimationKey;
	animationId?: string;
	data?: unknown;
}

export interface RemoveDrawerAnimationPayload {
	drawerId: string;
	animationId: string;
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
	id: string;
	key: AnimationKey;
	dispose: boolean;
	data?: D;
}

export interface AnimationSlice {
	animations: Record<string, DrawerAnimation[]>;
	addDrawerAnimation: (payload: AddDrawerAnimationActionPayload) => void;
	removeDrawerAnimation: (payload: RemoveDrawerAnimationPayload) => void;
	removeAllDrawerAnimations: (drawerId: string) => void;
	disposeDrawerAnimation: (payload: DisposeDrawerAnimationPayload) => void;
	refreshDrawerAnimation: (payload: RefreshDrawerAnimationPayload) => void;
}

export const createAnimationSlice: StateCreator<RootStore, [], [], AnimationSlice> = (set) => ({
	animations: {},
	addDrawerAnimation: (payload: AddDrawerAnimationActionPayload) =>
		set((state) => {
			const { drawerId, key, animationId = v1(), data } = payload;
			const drawerAnimations = state.animations[drawerId];

			const newAnimation = {
				id: animationId,
				key,
				dispose: false,
				data,
			};

			if (!drawerAnimations) {
				state.animations[drawerId] = [newAnimation];
				return state;
			}

			const animationExists = drawerAnimations.some((a) => a.id === newAnimation.id);
			if (animationExists) {
				return state;
			}

			state.animations[drawerId] = [...drawerAnimations, newAnimation];

			return state;
		}),
	removeDrawerAnimation: (payload: RemoveDrawerAnimationPayload) =>
		set((state) => {
			const { animationId, drawerId } = payload;
			const drawerAnimations = state.animations[drawerId];
			if (!drawerAnimations) {
				return state;
			}

			const removedAnimation = drawerAnimations.find((a) => a.id === animationId);
			if (!removedAnimation) {
				return state;
			}
			const updatedQueue = drawerAnimations.filter((a) => a !== removedAnimation);
			if (updatedQueue.length === 0) {
				delete state.animations[drawerId];
				return state;
			}

			state.animations[drawerId] = updatedQueue;

			return state;
		}),
	removeAllDrawerAnimations: (drawerId: string) =>
		set((state) => {
			delete state.animations[drawerId];

			return state;
		}),
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
		}),
	refreshDrawerAnimation: (payload: RefreshDrawerAnimationPayload) =>
		set((state) => {
			const { drawerId, key } = payload;
			const drawerAnimations = state.animations[drawerId];
			if (!drawerAnimations) {
				state.animations[drawerId] = [
					{
						id: v1(),
						key,
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
					id: v1(),
					key,
					dispose: false,
				},
			];

			return state;
		}),
});

export const selectDrawerAnimationByDrawerId =
	(drawerId: string) =>
	(state: RootStore): DrawerAnimation | null =>
		state.animations[drawerId]?.at(0) ?? null;

export const selectDrawerAnimationById =
	(drawerId?: string, animationId?: string) =>
	(state: RootStore): DrawerAnimation | null => {
		if (!drawerId || !animationId) {
			return null;
		}

		return state.animations[drawerId]?.find((a) => a.id === animationId) ?? null;
	};

