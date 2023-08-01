import { createEntityAdapter, createSlice, EntityState } from '@reduxjs/toolkit';
import { v1 } from 'uuid';
import { AnimationKey } from '../animation';
import { RootState } from './rootState';

export interface DrawerAnimation<D = unknown> {
	id: string;
	key: AnimationKey;
	dispose: boolean;
	data?: D;
}

export interface DrawerAnimations {
	drawerId: string;
	queue: DrawerAnimation[];
}

export interface AddDrawerAnimationActionPayload {
	drawerId: string;
	key: AnimationKey;
	animationId?: string;
	data?: unknown;
}

export interface AddDrawerAnimationAction {
	type: string;
	payload: AddDrawerAnimationActionPayload;
}

export interface RefreshDrawerAnimationAction {
	type: string;
	payload: {
		drawerId: string;
		key: AnimationKey;
	};
}

export interface RemoveDrawerAnimationAction {
	type: string;
	payload: {
		drawerId: string;
		animationId: string;
	};
}

export interface DisposeDrawerAnimationAction {
	type: string;
	payload: {
		drawerId: string;
		animationId: string;
	};
}

export interface DrawerAnimationState {
	animations: EntityState<DrawerAnimations>;
}

const animationsAdapter = createEntityAdapter<DrawerAnimations>({
	selectId: (drawerAnimation) => drawerAnimation.drawerId,
});

const initialState: DrawerAnimationState = {
	animations: animationsAdapter.getInitialState(),
};

export const drawerAnimationsSlice = createSlice({
	name: 'drawerAnimations',
	initialState,
	reducers: {
		addDrawerAnimation: (slice: DrawerAnimationState, action: AddDrawerAnimationAction) => {
			const { animations } = slice;
			const { drawerId, key, animationId = v1(), data } = action.payload;
			const drawerAnimations = animations.entities[drawerId];

			const newAnimation = {
				id: animationId,
				key,
				dispose: false,
				data,
			};

			slice.animations = drawerAnimations
				? animationsAdapter.updateOne(animations, {
						id: drawerId,
						changes: {
							queue: [...drawerAnimations.queue, newAnimation],
						},
				  })
				: animationsAdapter.addOne(animations, {
						drawerId,
						queue: [newAnimation],
				  });
		},
		refreshDrawerAnimation: (
			slice: DrawerAnimationState,
			action: RefreshDrawerAnimationAction,
		) => {
			const { animations } = slice;
			const { drawerId, key } = action.payload;
			const drawerAnimations = animations.entities[drawerId];
			if (!drawerAnimations) {
				const animationId = v1();
				slice.animations = animationsAdapter.addOne(animations, {
					drawerId,
					queue: [
						{
							id: animationId,
							key,
							dispose: false,
						},
					],
				});
				return;
			}

			const { queue } = drawerAnimations;
			const [currentAnimation] = queue;
			if (currentAnimation.key === key) {
				const [, ...otherAnimations] = queue;
				slice.animations = animationsAdapter.updateOne(animations, {
					id: drawerId,
					changes: {
						queue: [{ ...currentAnimation, dispose: false }, ...otherAnimations],
					},
				});
				return;
			}

			const animationId = v1();
			slice.animations = animationsAdapter.updateOne(animations, {
				id: drawerId,
				changes: {
					queue: [
						...queue,
						{
							id: animationId,
							key,
							dispose: false,
						},
					],
				},
			});
		},
		disposeDrawerAnimation: (
			slice: DrawerAnimationState,
			action: DisposeDrawerAnimationAction,
		) => {
			const { animations } = slice;
			const { drawerId, animationId } = action.payload;
			const drawerAnimations = animations.entities[drawerId];
			if (!drawerAnimations) {
				return;
			}

			const updatedQueue = drawerAnimations.queue.map((a) =>
				a.id === animationId
					? {
							...a,
							dispose: true,
					  }
					: a,
			);
			slice.animations = animationsAdapter.updateOne(animations, {
				id: drawerId,
				changes: {
					queue: updatedQueue,
				},
			});
		},
		removeDrawerAnimation: (
			slice: DrawerAnimationState,
			action: RemoveDrawerAnimationAction,
		) => {
			const { animations } = slice;
			const { animationId, drawerId } = action.payload;
			const drawerAnimations = animations.entities[drawerId];
			if (!drawerAnimations) {
				return;
			}

			const removedAnimation = drawerAnimations.queue.find((a) => a.id === animationId);
			if (!removedAnimation) {
				return;
			}
			const updatedQueue = drawerAnimations.queue.filter((a) => a !== removedAnimation);
			slice.animations =
				updatedQueue.length > 0
					? animationsAdapter.updateOne(animations, {
							id: drawerId,
							changes: {
								queue: updatedQueue,
							},
					  })
					: animationsAdapter.removeOne(animations, drawerId);
		},
	},
});

export const {
	addDrawerAnimation,
	removeDrawerAnimation,
	refreshDrawerAnimation,
	disposeDrawerAnimation,
} = drawerAnimationsSlice.actions;

const drawerAnimationsSelector = animationsAdapter.getSelectors<RootState>(
	(state) => state.drawerAnimations.animations,
);

export const selectDrawerAnimationByDrawerId =
	(drawerId: string) =>
	(state: RootState): DrawerAnimation | null => {
		const drawerAnimations = drawerAnimationsSelector.selectById(state, drawerId);
		return drawerAnimations?.queue.at(0) ?? null;
	};

export const selectDrawerAnimationById =
	(drawerId?: string, animationId?: string) =>
	(state: RootState): DrawerAnimation | null => {
		if (!drawerId || !animationId) {
			return null;
		}

		const drawerAnimations = drawerAnimationsSelector.selectById(state, drawerId);
		return drawerAnimations?.queue.find((a) => a.id === animationId) ?? null;
	};

export default drawerAnimationsSlice.reducer;
