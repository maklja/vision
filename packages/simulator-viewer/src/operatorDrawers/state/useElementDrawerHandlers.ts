import { drawerDragStateHandlers } from './drawerDragStateHandlers';
import { drawerSelectStateHandlers } from './drawerSelectStateHandlers';
import { drawerAnimationStateHandlers } from './drawerAnimationStateHandlers';
import { SimulationState } from '../../store/simulation';
import { StageState, isStageStateDragging } from '../../store/stage';
import { useRootStore } from '../../store/rootStore';
import { DrawerEvents } from '../../drawers';

export const useElementDrawerHandlers = (): DrawerEvents =>
	useRootStore((storeState) => {
		if (storeState.simulation.state === SimulationState.Running) {
			return drawerAnimationStateHandlers(storeState);
		}

		if (storeState.state === StageState.Select) {
			return drawerSelectStateHandlers(storeState);
		}

		if (isStageStateDragging(storeState.state)) {
			return drawerDragStateHandlers(storeState);
		}

		return {};
	});
