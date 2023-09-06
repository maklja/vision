import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/rootState';
import { connectPointDrawConnectLineStateHandlers } from './connectPointDrawConnectLineStateHandlers';
import { connectPointSelectStateHandlers } from './connectPointSelectStateHandlers';
import { StageState, selectStageState } from '../../store/stage';

export const useConnectPointHandlers = () => {
	const stageState = useAppSelector(selectStageState);
	const appDispatch = useAppDispatch();

	return useMemo(() => {
		if (stageState === StageState.Select) {
			return connectPointSelectStateHandlers(appDispatch);
		}

		if (stageState === StageState.DrawConnectLine) {
			return connectPointDrawConnectLineStateHandlers(appDispatch);
		}

		return {};
	}, [stageState]);
};

