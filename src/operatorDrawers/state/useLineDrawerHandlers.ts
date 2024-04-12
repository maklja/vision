import { useMemo } from 'react';
import { useAppSelector } from '../../store/rootState';
import { connectLineSelectStateHandlers } from './connectLineSelectStateHandlers';
import { connectLineDragStateHandlers } from './connectLineDragStateHandlers';
import { SimulationState, selectSimulation } from '../../store/simulation';
import { StageState, isStageStateDragging, selectStageState } from '../../store/stage';
import { useRootStore } from '../../store/rootStateNew';

export const useLineDrawerHandlers = () => {
	const simulation = useAppSelector(selectSimulation);
	const stageState = useRootStore(selectStageState());
	const state = useRootStore();

	return useMemo(() => {
		if (simulation.state === SimulationState.Running) {
			return {};
		}

		if (stageState === StageState.Select) {
			return connectLineSelectStateHandlers(state);
		}

		if (isStageStateDragging(stageState)) {
			return connectLineDragStateHandlers(state);
		}

		return {};
	}, [stageState, simulation.state]);
};

