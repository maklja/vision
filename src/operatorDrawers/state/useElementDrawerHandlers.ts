import { useMemo } from 'react';
import { useAppSelector } from '../../store/rootState';
import { drawerDragStateHandlers } from './drawerDragStateHandlers';
import { drawerSelectStateHandlers } from './drawerSelectStateHandlers';
import { drawerAnimationStateHandlers } from './drawerAnimationStateHandlers';
import { SimulationState, selectSimulation } from '../../store/simulation';
import { StageState, isStageStateDragging, selectStageState } from '../../store/stage';
import { useRootStore } from '../../store/rootStateNew';

export const useElementDrawerHandlers = () => {
	const simulation = useAppSelector(selectSimulation);
	const stageState = useRootStore(selectStageState());
	const state = useRootStore();

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

