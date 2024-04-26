import { connectPointDrawConnectLineStateHandlers } from './connectPointDrawConnectLineStateHandlers';
import { connectPointSelectStateHandlers } from './connectPointSelectStateHandlers';
import { StageState } from '../../store/stage';
import { useRootStore } from '../../store/rootStore';
import { ConnectPointsDrawerEvents } from '../../drawers';

export const useConnectPointHandlers = (): ConnectPointsDrawerEvents =>
	useRootStore((storeState) => {
		if (storeState.state === StageState.Select) {
			return connectPointSelectStateHandlers(storeState);
		}

		if (storeState.state === StageState.DrawConnectLine) {
			return connectPointDrawConnectLineStateHandlers(storeState);
		}

		return {};
	});
