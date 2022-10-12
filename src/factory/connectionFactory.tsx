import { Line } from 'react-konva';
import { ConnectLine } from '../model';

export const createConnectLineElement = (connectionLine: ConnectLine) => {
	const { points } = connectionLine;
	return <Line stroke="black" points={points.flatMap((p) => [p.x, p.y])} />;
};

