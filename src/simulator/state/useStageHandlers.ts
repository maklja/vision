import { stageSelectStateHandlers } from './stageSelectStateHandlers';
import { stageDrawConnectLineStateHandlers } from './stageDrawConnectLineStateHandlers';
import { StageState } from '../../store/stage';
import { useRootStore } from '../../store/rootStore';
import { StageEvents } from '../SimulatorStage';

export const useStageHandlers = (): StageEvents =>
	useRootStore((storeState) => {
		if (storeState.state === StageState.Select || storeState.state === StageState.LassoSelect) {
			return stageSelectStateHandlers(storeState);
		}

		if (storeState.state === StageState.DrawConnectLine) {
			return stageDrawConnectLineStateHandlers(storeState);
		}

		return {};
	});

