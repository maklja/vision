import { useMemo } from 'react';
import { drawerDragStateHandlers } from './drawerDragStateHandlers';
import { drawerSelectStateHandlers } from './drawerSelectStateHandlers';
import { drawerAnimationStateHandlers } from './drawerAnimationStateHandlers';
import { SimulationState, selectSimulation } from '../../store/simulation';
import { StageState, isStageStateDragging, selectStageState } from '../../store/stage';
import { useStore } from '../../store/rootState';

export const useElementDrawerHandlers = () => {
	const simulation = useStore(selectSimulation);
	const stageState = useStore(selectStageState());
	const state = useStore();

	return useMemo(() => {
		if (simulation.state === SimulationState.Running) {
			return drawerAnimationStateHandlers(state);
		}

		if (stageState === StageState.Select) {
			return drawerSelectStateHandlers(state);
		}

		if (isStageStateDragging(stageState)) {
			return drawerDragStateHandlers(state);
		}

		return {};
	}, [stageState, simulation.state]);
};
