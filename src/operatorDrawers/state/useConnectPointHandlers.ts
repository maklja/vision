import { connectPointDrawConnectLineStateHandlers } from './connectPointDrawConnectLineStateHandlers';
import { connectPointSelectStateHandlers } from './connectPointSelectStateHandlers';
import { StageState } from '../../store/stage';
import { useRootStore } from '../../store/rootStore';
import { ConnectPointsDrawerEvents } from '../../drawers';

export const useConnectPointHandlers = (): [ConnectPointsDrawerEvents, StageState] =>
	useRootStore(
		(storeState) => {
			let handler: ConnectPointsDrawerEvents = {};
			if (storeState.state === StageState.Select) {
				handler = connectPointSelectStateHandlers(storeState);
			}

			if (storeState.state === StageState.DrawConnectLine) {
				handler = connectPointDrawConnectLineStateHandlers(storeState);
			}

			return [handler, storeState.state];
		},
		(prevHandlers, handlers) => prevHandlers[1] === handlers[1],
	);

