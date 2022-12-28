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
	animations: DrawerAnimation[];
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

const animationsAdapter = createEntityAdapter<DrawerAnimations>({
	selectId: (drawerAnimation) => drawerAnimation.drawerId,
});

export const drawerAnimationsSlice = createSlice({
	name: 'drawerAnimations',
	initialState: animationsAdapter.getInitialState(),
	reducers: {
		addDrawerAnimation: (
			slice: EntityState<DrawerAnimations>,
			action: AddDrawerAnimationAction,
		) => {
			const { drawerId, key } = action.payload;
			const drawerAnimations = slice.entities[drawerId];

			const newAnimation = {
				id: v1(),
				key,
				dispose: false,
			};

			return drawerAnimations
				? animationsAdapter.updateOne(slice, {
						id: drawerId,
						changes: {
							animations: [...drawerAnimations.animations, newAnimation],
						},
				  })
				: animationsAdapter.addOne(slice, {
						drawerId,
						animations: [newAnimation],
				  });
		},
		refreshDrawerAnimation: (
			slice: EntityState<DrawerAnimations>,
			action: RefreshDrawerAnimationAction,
		) => {
			const { drawerId, key } = action.payload;
			const drawerAnimations = slice.entities[drawerId];
			if (!drawerAnimations) {
				return animationsAdapter.addOne(slice, {
					drawerId,
					animations: [
						{
							id: v1(),
							key,
							dispose: false,
						},
					],
				});
			}

			const { animations } = drawerAnimations;
			const [currentAnimation] = animations;
			if (currentAnimation.key === key) {
				const [, ...otherAnimations] = animations;
				return animationsAdapter.updateOne(slice, {
					id: drawerId,
					changes: {
						animations: [{ ...currentAnimation, dispose: false }, ...otherAnimations],
					},
				});
			}

			return animationsAdapter.updateOne(slice, {
				id: drawerId,
				changes: {
					animations: [
						...animations,
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
			slice: EntityState<DrawerAnimations>,
			action: DisposeDrawerAnimationAction,
		) => {
			const { drawerId, animationId } = action.payload;
			const drawerAnimations = slice.entities[drawerId];
			if (!drawerAnimations) {
				return;
			}

			const updatedAnimations = drawerAnimations.animations.map((a) =>
				a.id === animationId
					? {
							...a,
							dispose: true,
					  }
					: a,
			);
			return animationsAdapter.updateOne(slice, {
				id: drawerId,
				changes: {
					animations: updatedAnimations,
				},
			});
		},
		removeDrawerAnimation: (
			slice: EntityState<DrawerAnimations>,
			action: RemoveDrawerAnimationAction,
		) => {
			const { animationId, drawerId } = action.payload;
			const drawerAnimations = slice.entities[drawerId];
			if (!drawerAnimations) {
				return;
			}

			const updatedAnimations = drawerAnimations.animations.filter(
				(a) => a.id !== animationId,
			);

			if (updatedAnimations.length === 0) {
				return animationsAdapter.removeOne(slice, drawerId);
			}

			return animationsAdapter.updateOne(slice, {
				id: drawerId,
				changes: {
					animations: updatedAnimations,
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
	(state) => state.dAnimations,
);

export const selectDrawerAnimationById =
	(drawerId: string) =>
	(state: RootState): DrawerAnimation | null => {
		const drawerAnimations = drawerAnimationsSelector.selectById(state, drawerId);

		if (!drawerAnimations) {
			return null;
		}

		return drawerAnimations.animations.at(0) ?? null;
	};

export default drawerAnimationsSlice.reducer;
