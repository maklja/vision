import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/rootState';
import { StageState, selectStageState } from '../../store/stageSlice';
import { stageSelectStateHandlers } from './stageSelectStateHandlers';
import { stageDrawConnectLineStateHandlers } from './stageDrawConnectLineStateHandlers';

export const useStageHandlers = () => {
	const stageState = useAppSelector(selectStageState);
	const appDispatch = useAppDispatch();

	return useMemo(() => {
		if (stageState === StageState.Select) {
			return stageSelectStateHandlers(appDispatch);
		}

		if (stageState === StageState.DrawConnectLine) {
			return stageDrawConnectLineStateHandlers(appDispatch);
		}

		return {};
	}, [stageState]);
};

