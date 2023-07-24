import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/rootState';
import { selectStageState, StageState } from '../../store/stageSlice';
import { drawerDragStateHandlers } from './drawerDragStateHandlers';
import { drawerSelectStateHandlers } from './drawerSelectStateHandlers';

export const useElementDrawerHandlers = () => {
	const stageState = useAppSelector(selectStageState);
	const appDispatch = useAppDispatch();

	return useMemo(() => {
		if (stageState === StageState.Select) {
			return drawerSelectStateHandlers(appDispatch);
		}

		if (stageState === StageState.Dragging) {
			return drawerDragStateHandlers(appDispatch);
		}

		return {};
	}, [stageState]);
};
