import { createSlice, createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { RootState } from './rootState';

export interface CreateAnimationSimulation {
	type: string;
	payload: {
		executionType: AnimationExecutionType;
		animations: DrawerAnimation[];
	};
}

export interface RemoveDrawerAnimationAction {
	type: string;
	payload: {
		id: string;
		animationId: string;
	};
}

export enum AnimationExecutionType {
	Group = 'group',
	Sequence = 'sequence',
}

export interface DrawerAnimation {
	id: string;
	animationId: string;
	animationName: string;
}

export interface AnimationSimulation {
	id: string;
	executionType: AnimationExecutionType;
	animations: DrawerAnimation[];
}

const animationSimulationAdapter = createEntityAdapter<AnimationSimulation>({
	selectId: (animationSimulation) => animationSimulation.id,
});

export const animationSlice = createSlice({
	name: 'animations',
	initialState: animationSimulationAdapter.getInitialState(),
	reducers: {
		createAnimationSimulation: animationSimulationAdapter.addOne,
		removeAnimationSimulation: animationSimulationAdapter.removeOne,
		removeAnimation: (
			slice: EntityState<AnimationSimulation>,
			action: RemoveDrawerAnimationAction,
		) => {
			const { id, animationId } = action.payload;
			const simulation = slice.entities[id];
			if (!simulation) {
				return;
			}

			const updatedAnimations = simulation.animations.filter(
				(a) => a.animationId !== animationId,
			);
			if (updatedAnimations.length === 0) {
				return animationSimulationAdapter.removeOne(slice, id);
			}

			return animationSimulationAdapter.updateOne(slice, {
				id,
				changes: {
					animations: updatedAnimations,
				},
			});
		},
	},
});

export const { createAnimationSimulation, removeAnimationSimulation, removeAnimation } =
	animationSlice.actions;

const animationsSelector = animationSimulationAdapter.getSelectors<RootState>(
	(state) => state.animations,
);

export const selectAnimations = (state: RootState) => animationsSelector.selectAll(state);

export const selectDrawerAnimations = (id: string) => (state: RootState) => {
	const aSimulations = animationsSelector.selectAll(state);
	const drawerSimulations = aSimulations.filter((simulation) =>
		simulation.animations.some((a) => a.id === id),
	);

	while (drawerSimulations.length > 0) {
		const simulation = drawerSimulations.shift();
		if (!simulation) {
			return null;
		}

		if (simulation.executionType === AnimationExecutionType.Group) {
			return simulation.animations.find((a) => a.id === id) ?? null;
		}

		const nextAnimationSequence = simulation.animations.at(0);
		if (nextAnimationSequence?.id === id) {
			return nextAnimationSequence;
		}
	}

	return null;
};

export default animationSlice.reducer;

