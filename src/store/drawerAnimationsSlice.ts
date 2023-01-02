import { createEntityAdapter, createSlice, EntityState } from '@reduxjs/toolkit';
import { v1 } from 'uuid';
import { AnimationKey } from '../animation';
import { RootState } from './rootState';

export interface DrawerAnimation<D = unknown> {
	id: string;
	key: AnimationKey;
	dispose: boolean;
	simulationId?: string;
	data?: D;
}

export interface SimulationAnimation extends DrawerAnimation {
	drawerId: string;
}

export interface DrawerAnimations {
	drawerId: string;
	queue: DrawerAnimation[];
}

export interface SimulationAnimations {
	simulationId: string;
	queue: SimulationAnimation[];
}

export interface AddDrawerAnimationActionPayload {
	drawerId: string;
	key: AnimationKey;
	animationId?: string;
	simulationId?: string;
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
		simulationId?: string;
	};
}

export interface RemoveDrawerAnimationAction {
	type: string;
	payload: {
		drawerId: string;
		animationId: string;
	};
}

export interface AddSimulationAnimationAction {
	type: string;
	payload: AddDrawerAnimationActionPayload;
}

export interface AddSimulationAnimationsAction {
	type: string;
	payload: {
		simulationId: string;
		animations: { drawerId: string; key: AnimationKey; animationId?: string; data?: unknown }[];
	};
}

export interface RemoveSimulationAnimationAction {
	type: string;
	payload: {
		simulationId: string;
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
	simulations: EntityState<SimulationAnimations>;
}

const animationsAdapter = createEntityAdapter<DrawerAnimations>({
	selectId: (drawerAnimation) => drawerAnimation.drawerId,
});

const simulationsAdapter = createEntityAdapter<SimulationAnimations>({
	selectId: (simulationAnimation) => simulationAnimation.simulationId,
});

const initialState: DrawerAnimationState = {
	animations: animationsAdapter.getInitialState(),
	simulations: simulationsAdapter.getInitialState(),
};

const removeSimulationAnimationHandler = (
	slice: DrawerAnimationState,
	animationId: string,
	simulationId?: string,
) => {
	if (!simulationId) {
		return;
	}

	const { simulations } = slice;
	const simulation = simulations.entities[simulationId];
	if (!simulation) {
		return;
	}

	const updatedQueue = simulation.queue.filter((a) => a.id !== animationId);
	slice.simulations =
		updatedQueue.length === 0
			? simulationsAdapter.removeOne(simulations, simulationId)
			: simulationsAdapter.updateOne(simulations, {
					id: simulationId,
					changes: {
						queue: updatedQueue,
					},
			  });
};

export const drawerAnimationsSlice = createSlice({
	name: 'drawerAnimations',
	initialState,
	reducers: {
		addDrawerAnimation: (slice: DrawerAnimationState, action: AddDrawerAnimationAction) => {
			const { animations } = slice;
			const { drawerId, key, simulationId, animationId = v1(), data } = action.payload;
			const drawerAnimations = animations.entities[drawerId];

			const newAnimation = {
				id: animationId,
				key,
				dispose: false,
				simulationId,
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

			removeSimulationAnimationHandler(slice, animationId, removedAnimation?.simulationId);
		},
		addSimulationAnimations: (
			slice: DrawerAnimationState,
			action: AddSimulationAnimationsAction,
		) => {
			const { animations, simulationId } = action.payload;
			const { simulations } = slice;
			const simulation = simulations.entities[simulationId];

			const newAnimations = animations.map((a) => ({
				id: a.animationId ?? v1(),
				drawerId: a.drawerId,
				key: a.key,
				simulationId,
				dispose: false,
				data: a.data,
			}));

			slice.simulations = !simulation
				? simulationsAdapter.addOne(simulations, {
						simulationId,
						queue: newAnimations,
				  })
				: simulationsAdapter.updateOne(simulations, {
						id: simulationId,
						changes: {
							queue: [...simulation.queue, ...newAnimations],
						},
				  });
		},
		addSimulationAnimation: (
			slice: DrawerAnimationState,
			action: AddSimulationAnimationAction,
		) => {
			const { simulationId = v1(), animationId = v1(), drawerId, key, data } = action.payload;
			const { simulations } = slice;
			const simulation = simulations.entities[simulationId];

			const newAnimation: SimulationAnimation = {
				id: animationId,
				drawerId,
				key,
				simulationId,
				dispose: false,
				data,
			};

			slice.simulations = !simulation
				? simulationsAdapter.addOne(simulations, {
						simulationId,
						queue: [newAnimation],
				  })
				: simulationsAdapter.updateOne(simulations, {
						id: simulationId,
						changes: {
							queue: [...simulation.queue, newAnimation],
						},
				  });
		},
		removeSimulationAnimation: (
			slice: DrawerAnimationState,
			action: RemoveSimulationAnimationAction,
		) => {
			removeSimulationAnimationHandler(
				slice,
				action.payload.animationId,
				action.payload.simulationId,
			);
		},
	},
});

export const {
	addDrawerAnimation,
	removeDrawerAnimation,
	refreshDrawerAnimation,
	disposeDrawerAnimation,
	addSimulationAnimation,
	addSimulationAnimations,
	removeSimulationAnimation,
} = drawerAnimationsSlice.actions;

const drawerAnimationsSelector = animationsAdapter.getSelectors<RootState>(
	(state) => state.dAnimations.animations,
);

const simulationsSelector = simulationsAdapter.getSelectors<RootState>(
	(state) => state.dAnimations.simulations,
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

export const selectSimulationNextAnimation =
	(simulationId: string) =>
	(state: RootState): SimulationAnimation | null => {
		const simulation = simulationsSelector.selectById(state, simulationId);

		if (!simulation) {
			return null;
		}

		return simulation.queue.at(0) ?? null;
	};

export default drawerAnimationsSlice.reducer;
