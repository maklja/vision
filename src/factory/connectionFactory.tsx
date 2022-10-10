import { Line } from 'react-konva';
import { ConnectLine } from '../model';

export const createConnectLineElement = (connectionLine: ConnectLine) => {
	return (
		<Line
			stroke="black"
			points={[
				connectionLine.sourceX,
				connectionLine.sourceY,
				connectionLine.targetX,
				connectionLine.targetY,
			]}
		/>
	);
};

