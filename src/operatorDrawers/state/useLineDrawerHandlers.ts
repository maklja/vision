import { connectLineSelectStateHandlers } from './connectLineSelectStateHandlers';
import { connectLineDragStateHandlers } from './connectLineDragStateHandlers';
import { SimulationState } from '../../store/simulation';
import { StageState, isStageStateDragging } from '../../store/stage';
import { useRootStore } from '../../store/rootStore';
import { LineDrawerEvents } from '../../drawers';

export const useLineDrawerHandlers = (): LineDrawerEvents =>
	useRootStore((stageStore) => {
		if (stageStore.simulation.state === SimulationState.Running) {
			return {};
		}

		if (stageStore.state === StageState.Select) {
			return connectLineSelectStateHandlers(stageStore);
		}

		if (isStageStateDragging(stageStore.state)) {
			return connectLineDragStateHandlers(stageStore);
		}

		return {};
	});
