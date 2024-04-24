import { drawerDragStateHandlers } from './drawerDragStateHandlers';
import { drawerSelectStateHandlers } from './drawerSelectStateHandlers';
import { drawerAnimationStateHandlers } from './drawerAnimationStateHandlers';
import { SimulationState } from '../../store/simulation';
import { StageState, isStageStateDragging } from '../../store/stage';
import { useRootStore } from '../../store/rootStore';
import { DrawerEvents } from '../../drawers';

export const useElementDrawerHandlers = (): [DrawerEvents, StageState, SimulationState] =>
	useRootStore(
		(storeState) => {
			let handler: DrawerEvents = {};
			if (storeState.simulation.state === SimulationState.Running) {
				handler = drawerAnimationStateHandlers(storeState);
			} else if (storeState.state === StageState.Select) {
				handler = drawerSelectStateHandlers(storeState);
			} else if (isStageStateDragging(storeState.state)) {
				handler = drawerDragStateHandlers(storeState);
			}

			return [handler, storeState.state, storeState.simulation.state];
		},
		(prevHandler, handler) => {
			const [, prevState, prevSimState] = prevHandler;
			const [, state, simState] = handler;

			return prevState === state && prevSimState === simState;
		},
	);

