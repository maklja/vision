import { Line } from 'react-konva';
import { ConnectLine } from '../model';

export const createConnectLineElement = (connectionLine: ConnectLine) => {
	const { id, points } = connectionLine;
	return <Line key={id} stroke="black" points={points.flatMap((p) => [p.x, p.y])} />;
};

