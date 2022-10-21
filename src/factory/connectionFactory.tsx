import { ConnectLine } from '../model';
import { ConnectLineElement } from '../drawers';

export const createConnectLineElement = (connectionLine: ConnectLine) => {
	const { id, points } = connectionLine;
	return <ConnectLineElement key={id} id={id} points={points} />;
};

