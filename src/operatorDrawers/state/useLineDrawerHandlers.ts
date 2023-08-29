import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/rootState';
import { selectStageState, StageState } from '../../store/stageSlice';
import { connectLineSelectStateHandlers } from './connectLineSelectStateHandlers';
import { connectLineDragStateHandlers } from './connectLineDragStateHandlers';
import { selectSimulation } from '../../store/simulation';

export const useLineDrawerHandlers = () => {
	const simulation = useAppSelector(selectSimulation);
	const stageState = useAppSelector(selectStageState);
	const appDispatch = useAppDispatch();

	return useMemo(() => {
		if (stageState === StageState.Select) {
			return connectLineSelectStateHandlers(appDispatch);
		}

		if (stageState === StageState.Dragging) {
			return connectLineDragStateHandlers(appDispatch);
		}

		return {};
	}, [stageState, simulation.state]);
};
