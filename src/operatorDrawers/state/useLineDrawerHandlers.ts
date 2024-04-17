import { useMemo } from 'react';
import { connectLineSelectStateHandlers } from './connectLineSelectStateHandlers';
import { connectLineDragStateHandlers } from './connectLineDragStateHandlers';
import { SimulationState, selectSimulation } from '../../store/simulation';
import { StageState, isStageStateDragging, selectStageState } from '../../store/stage';
import { useRootStore } from '../../store/rootStore';

export function useLineDrawerHandlers() {
	const simulation = useRootStore(selectSimulation);
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
}

