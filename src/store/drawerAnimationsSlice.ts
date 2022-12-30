import { createEntityAdapter, createSlice, EntityState } from '@reduxjs/toolkit';
import { v1 } from 'uuid';
import { AnimationKey } from '../animation';
import { RootState } from './rootState';

export interface DrawerAnimation {
	id: string;
	key: AnimationKey;
	dispose: boolean;
}

export interface DrawerAnimations {
	drawerId: string;
	queue: DrawerAnimation[];
}

export interface AddDrawerAnimationAction {
	type: string;
	payload: {
		drawerId: string;
		key: AnimationKey;
	};
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
			const { drawerId, key } = action.payload;
			const drawerAnimations = animations.entities[drawerId];

			const newAnimation = {
				id: v1(),
				key,
				dispose: false,
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
				slice.animations = animationsAdapter.addOne(animations, {
					drawerId,
					queue: [
						{
							id: v1(),
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

			slice.animations = animationsAdapter.updateOne(animations, {
				id: drawerId,
				changes: {
					queue: [
						...queue,
						{
							id: v1(),
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

			const updatedQueue = drawerAnimations.queue.filter((a) => a.id !== animationId);

			if (updatedQueue.length === 0) {
				slice.animations = animationsAdapter.removeOne(animations, drawerId);
				return;
			}

			slice.animations = animationsAdapter.updateOne(animations, {
				id: drawerId,
				changes: {
					queue: updatedQueue,
				},
			});
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
	(state) => state.dAnimations.animations,
);

export const selectDrawerAnimationById =
	(drawerId: string) =>
	(state: RootState): DrawerAnimation | null => {
		const drawerAnimations = drawerAnimationsSelector.selectById(state, drawerId);

		if (!drawerAnimations) {
			return null;
		}

		return drawerAnimations.queue.at(0) ?? null;
	};

export default drawerAnimationsSlice.reducer;
