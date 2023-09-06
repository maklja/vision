import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/rootState';
import { drawerDragStateHandlers } from './drawerDragStateHandlers';
import { drawerSelectStateHandlers } from './drawerSelectStateHandlers';
import { drawerAnimationStateHandlers } from './drawerAnimationStateHandlers';
import { SimulationState, selectSimulation } from '../../store/simulation';
import { StageState, selectStageState } from '../../store/stage';

export const useElementDrawerHandlers = () => {
	const simulation = useAppSelector(selectSimulation);
	const stageState = useAppSelector(selectStageState);
	const appDispatch = useAppDispatch();

	return useMemo(() => {
		if (simulation.state === SimulationState.Running) {
			return drawerAnimationStateHandlers(appDispatch);
		}

		if (stageState === StageState.Select) {
			return drawerSelectStateHandlers(appDispatch);
		}

		if (stageState === StageState.Dragging) {
			return drawerDragStateHandlers(appDispatch);
		}

		return {};
	}, [stageState, simulation.state]);
};

