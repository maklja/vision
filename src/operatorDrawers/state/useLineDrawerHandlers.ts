import { useMemo } from 'react';
import { connectLineSelectStateHandlers } from './connectLineSelectStateHandlers';
import { connectLineDragStateHandlers } from './connectLineDragStateHandlers';
import { SimulationState, selectSimulation } from '../../store/simulation';
import { StageState, isStageStateDragging, selectStageState } from '../../store/stage';
import { useStore } from '../../store/rootState';

export function useLineDrawerHandlers() {
	const simulation = useStore(selectSimulation);
	const stageState = useStore(selectStageState());
	const state = useStore();

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
}

