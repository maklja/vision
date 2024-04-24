import { connectLineSelectStateHandlers } from './connectLineSelectStateHandlers';
import { connectLineDragStateHandlers } from './connectLineDragStateHandlers';
import { SimulationState } from '../../store/simulation';
import { StageState, isStageStateDragging } from '../../store/stage';
import { useRootStore } from '../../store/rootStore';
import { LineDrawerEvents } from '../../drawers';

export const useLineDrawerHandlers = (): [LineDrawerEvents, StageState, SimulationState] =>
	useRootStore(
		(stageStore) => {
			let handler: LineDrawerEvents = {};

			if (stageStore.simulation.state === SimulationState.Running) {
				handler = {};
			} else if (stageStore.state === StageState.Select) {
				handler = connectLineSelectStateHandlers(stageStore);
			} else if (isStageStateDragging(stageStore.state)) {
				handler = connectLineDragStateHandlers(stageStore);
			}

			return [handler, stageStore.state, stageStore.simulation.state];
		},
		(prevHandler, handler) => {
			const [, prevState, prevSimState] = prevHandler;
			const [, state, simState] = handler;

			return prevState === state && prevSimState === simState;
		},
	);

