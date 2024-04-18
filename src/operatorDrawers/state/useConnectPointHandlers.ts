import { useMemo } from 'react';
import { connectPointDrawConnectLineStateHandlers } from './connectPointDrawConnectLineStateHandlers';
import { connectPointSelectStateHandlers } from './connectPointSelectStateHandlers';
import { StageState, selectStageState } from '../../store/stage';
import { useRootStore } from '../../store/rootStore';

export function useConnectPointHandlers() {
	const stageState = useRootStore(selectStageState());
	const state = useRootStore();

	return useMemo(() => {
		if (stageState === StageState.Select) {
			return connectPointSelectStateHandlers(state);
		}

		if (stageState === StageState.DrawConnectLine) {
			return connectPointDrawConnectLineStateHandlers(state);
		}

		return {};
	}, [stageState]);
}

