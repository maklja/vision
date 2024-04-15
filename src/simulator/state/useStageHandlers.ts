import { useMemo } from 'react';
import { stageSelectStateHandlers } from './stageSelectStateHandlers';
import { stageDrawConnectLineStateHandlers } from './stageDrawConnectLineStateHandlers';
import { StageState, selectStageState } from '../../store/stage';
import { useStore } from '../../store/rootStore';

export function useStageHandlers() {
	const stageState = useStore(selectStageState());
	const state = useStore();

	return useMemo(() => {
		if (stageState === StageState.Select || stageState === StageState.LassoSelect) {
			return stageSelectStateHandlers(state);
		}

		if (stageState === StageState.DrawConnectLine) {
			return stageDrawConnectLineStateHandlers(state);
		}

		return {};
	}, [stageState]);
}

