import { useShallow } from 'zustand/react/shallow';
import { stageSelectStateHandlers } from './stageSelectStateHandlers';
import { stageDrawConnectLineStateHandlers } from './stageDrawConnectLineStateHandlers';
import { StageState } from '../../store/stage';
import { useRootStore } from '../../store/rootStore';
import { StageEvents } from '../SimulatorStage';

export const useStageHandlers = (): [StageEvents, StageState] =>
	useRootStore(
		useShallow((storeState) => {
			let handler: StageEvents = {};
			if (
				storeState.state === StageState.Select ||
				storeState.state === StageState.LassoSelect
			) {
				handler = stageSelectStateHandlers(storeState);
			} else if (storeState.state === StageState.DrawConnectLine) {
				handler = stageDrawConnectLineStateHandlers(storeState);
			}

			return [handler, storeState.state];
		}),
		(prevHandlers, handlers) => prevHandlers[1] === handlers[1],
	);

