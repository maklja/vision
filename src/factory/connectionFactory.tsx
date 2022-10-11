import { Line } from 'react-konva';
import { ConnectLine } from '../model';

export const createConnectLineElement = (connectionLine: ConnectLine) => {
	const { source, target } = connectionLine;
	return <Line stroke="black" points={[source.x, source.y, target.x, target.y]} />;
};

