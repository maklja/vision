import { Draft, createEntityAdapter } from '@reduxjs/toolkit';
import { AnimationKey } from '../../animation';
import { StageSlice } from '../stageSlice';
import { v1 } from 'uuid';
import { RootState } from '../rootState';

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

export interface RefreshDrawerAnimationPayload {
	drawerId: string;
	key: AnimationKey;
}

export interface RefreshDrawerAnimationAction {
	type: string;
	payload: RefreshDrawerAnimationPayload;
}

export interface RemoveDrawerAnimationAction {
	type: string;
	payload: {
		drawerId: string;
		animationId: string;
	};
}

export interface RemoveAllDrawerAnimationPayload {
	drawerId: string;
}

export interface RemoveAllDrawerAnimationAction {
	type: string;
	payload: RemoveAllDrawerAnimationPayload;
}

export interface DisposeDrawerAnimationPayload {
	drawerId: string;
	animationId: string;
}

export interface DisposeDrawerAnimationAction {
	type: string;
	payload: DisposeDrawerAnimationPayload;
}

const animationsAdapter = createEntityAdapter<DrawerAnimations>({
	selectId: (drawerAnimation) => drawerAnimation.drawerId,
});

export const createDrawerAnimationsInitialState = () => animationsAdapter.getInitialState();

export const refreshDrawerAnimationStateChange = (
	slice: Draft<StageSlice>,
	payload: RefreshDrawerAnimationPayload,
) => {
	const { animations } = slice;
	const { drawerId, key } = payload;
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
};

export const removeAllDrawerAnimationStateChange = (
	slice: Draft<StageSlice>,
	payload: RemoveAllDrawerAnimationPayload,
) => {
	slice.animations = animationsAdapter.removeOne(slice.animations, payload.drawerId);
};

export const disposeDrawerAnimationStateChange = (
	slice: Draft<StageSlice>,
	payload: DisposeDrawerAnimationPayload,
) => {
	const { animations } = slice;
	const { drawerId, animationId } = payload;
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
};

export const drawerAnimationsAdapterReducers = {
	addDrawerAnimation: (slice: Draft<StageSlice>, action: AddDrawerAnimationAction) => {
		const { animations } = slice;
		const { drawerId, key, animationId = v1(), data } = action.payload;
		const drawerAnimations = animations.entities[drawerId];

		const newAnimation = {
			id: animationId,
			key,
			dispose: false,
			data,
		};

		if (!drawerAnimations) {
			slice.animations = animationsAdapter.addOne(animations, {
				drawerId,
				queue: [newAnimation],
			});
			return;
		}

		const animationExists = drawerAnimations.queue.some((a) => a.id === newAnimation.id);
		if (animationExists) {
			return;
		}

		slice.animations = animationsAdapter.updateOne(animations, {
			id: drawerId,
			changes: {
				queue: [...drawerAnimations.queue, newAnimation],
			},
		});
	},
	refreshDrawerAnimation: (slice: Draft<StageSlice>, action: RefreshDrawerAnimationAction) =>
		refreshDrawerAnimationStateChange(slice, action.payload),
	disposeDrawerAnimation: (slice: Draft<StageSlice>, action: DisposeDrawerAnimationAction) =>
		disposeDrawerAnimationStateChange(slice, action.payload),
	removeDrawerAnimation: (slice: Draft<StageSlice>, action: RemoveDrawerAnimationAction) => {
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
	removeAllDrawerAnimation: (slice: Draft<StageSlice>, action: RemoveAllDrawerAnimationAction) =>
		removeAllDrawerAnimationStateChange(slice, action.payload),
};

const drawerAnimationsSelector = animationsAdapter.getSelectors<RootState>(
	(state) => state.stage.animations,
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
