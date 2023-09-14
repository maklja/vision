import { Layer } from 'react-konva';
import { useAppSelector } from '../../store/rootState';
import { ConnectLineDrawer } from '../../operatorDrawers';
import { selectStageConnectLines } from '../../store/connectLines';

export const ConnectLinesLayer = () => {
	const connectLines = useAppSelector(selectStageConnectLines);

	return (
		<Layer>
			{connectLines.map((cl) => (
				<ConnectLineDrawer key={cl.id} connectLine={cl} />
			))}
		</Layer>
	);
};

