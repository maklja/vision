import { ConnectLine } from '../model';
import { ConnectLineDrawer } from '../drawers';

export const createConnectLineElement = (connectionLine: ConnectLine) => {
	const { id, points } = connectionLine;
	return <ConnectLineDrawer key={id} id={id} points={points} />;
};

