import { produce } from 'immer';
import { v1 } from 'uuid';
import { StateCreator } from 'zustand';
import { AnimationKey } from '../../animation';
import { RootState } from '../rootStateNew';

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

export const createAnimationSlice: StateCreator<RootState, [], [], AnimationSlice> = (set) => ({
	animations: {},
	addDrawerAnimation: (payload: AddDrawerAnimationActionPayload) =>
		set(
			produce<RootState>((state) => {
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
					return;
				}

				const animationExists = drawerAnimations.some((a) => a.id === newAnimation.id);
				if (animationExists) {
					return;
				}

				state.animations[drawerId] = [...drawerAnimations, newAnimation];
			}),
		),
	removeDrawerAnimation: (payload: RemoveDrawerAnimationPayload) =>
		set(
			produce<RootState>((state) => {
				const { animationId, drawerId } = payload;
				const drawerAnimations = state.animations[drawerId];
				if (!drawerAnimations) {
					return;
				}

				const removedAnimation = drawerAnimations.find((a) => a.id === animationId);
				if (!removedAnimation) {
					return;
				}
				const updatedQueue = drawerAnimations.filter((a) => a !== removedAnimation);
				if (updatedQueue.length === 0) {
					delete state.animations[drawerId];
				}

				state.animations[drawerId] = updatedQueue;
			}),
		),
	removeAllDrawerAnimations: (drawerId: string) =>
		set(
			produce<RootState>((state) => {
				delete state.animations[drawerId];
			}),
		),
	disposeDrawerAnimation: (payload: DisposeDrawerAnimationPayload) =>
		set(
			produce<RootState>((state) => {
				const { drawerId, animationId } = payload;
				const drawerAnimations = state.animations[drawerId];
				if (!drawerAnimations) {
					return;
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
			}),
		),
	refreshDrawerAnimation: (payload: RefreshDrawerAnimationPayload) =>
		set(
			produce<RootState>((state) => {
				const { drawerId, key } = payload;
				const drawerAnimations = state.animations[drawerId];
				if (!drawerAnimations) {
					const animationId = v1();
					state.animations[drawerId] = [
						{
							id: animationId,
							key,
							dispose: false,
						},
					];
					return;
				}

				const [currentAnimation] = drawerAnimations;
				if (currentAnimation.key === key) {
					const [, ...otherAnimations] = drawerAnimations;
					state.animations[drawerId] = [
						{ ...currentAnimation, dispose: false },
						...otherAnimations,
					];
					return;
				}

				const animationId = v1();
				state.animations[drawerId] = [
					...drawerAnimations,
					{
						id: animationId,
						key,
						dispose: false,
					},
				];
			}),
		),
});

export const selectDrawerAnimationByDrawerId =
	(drawerId: string) =>
	(state: RootState): DrawerAnimation | null =>
		state.animations[drawerId]?.at(0) ?? null;

export const selectDrawerAnimationById =
	(drawerId?: string, animationId?: string) =>
	(state: RootState): DrawerAnimation | null => {
		if (!drawerId || !animationId) {
			return null;
		}

		return state.animations[drawerId]?.find((a) => a.id === animationId) ?? null;
	};

