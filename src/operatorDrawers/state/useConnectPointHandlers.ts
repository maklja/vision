import { useMemo } from 'react';
import { connectPointDrawConnectLineStateHandlers } from './connectPointDrawConnectLineStateHandlers';
import { connectPointSelectStateHandlers } from './connectPointSelectStateHandlers';
import { StageState, selectStageState } from '../../store/stage';
import { useStore } from '../../store/rootState';

export const useConnectPointHandlers = () => {
	const stageState = useStore(selectStageState());
	const state = useStore();

	return useMemo(() => {
		if (stageState === StageState.Select) {
			return connectPointSelectStateHandlers(state);
		}

		if (stageState === StageState.DrawConnectLine) {
			return connectPointDrawConnectLineStateHandlers(state);
		}

		return {};
	}, [stageState]);
};
