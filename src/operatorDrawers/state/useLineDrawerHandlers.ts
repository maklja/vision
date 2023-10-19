import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/rootState';
import { connectLineSelectStateHandlers } from './connectLineSelectStateHandlers';
import { connectLineDragStateHandlers } from './connectLineDragStateHandlers';
import { SimulationState, selectSimulation } from '../../store/simulation';
import { StageState, isStageStateDragging, selectStageState } from '../../store/stage';

export const useLineDrawerHandlers = () => {
	const simulation = useAppSelector(selectSimulation);
	const stageState = useAppSelector(selectStageState);
	const appDispatch = useAppDispatch();

	return useMemo(() => {
		if (simulation.state === SimulationState.Running) {
			return {};
		}

		if (stageState === StageState.Select) {
			return connectLineSelectStateHandlers(appDispatch);
		}

		if (isStageStateDragging(stageState)) {
			return connectLineDragStateHandlers(appDispatch);
		}

		return {};
	}, [stageState, simulation.state]);
};

