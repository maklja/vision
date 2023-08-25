import { Layer } from 'react-konva';
import { LineDrawer } from '../../drawers';
import { useAppSelector } from '../../store/rootState';
import { useThemeContext } from '../../store/stageSlice';
import { ConnectLineDrawer } from '../../operatorDrawers';
import { selectStageConnectLines, selectStageDraftConnectLine } from '../../store/connectLines';

export const ConnectLinesLayer = () => {
	const theme = useThemeContext();
	const connectLines = useAppSelector(selectStageConnectLines);
	const draftConnectLine = useAppSelector(selectStageDraftConnectLine);

	return (
		<Layer>
			{connectLines.map((cl) => (
				<ConnectLineDrawer key={cl.id} connectLine={cl} />
			))}
			{draftConnectLine ? (
				<LineDrawer
					key={draftConnectLine.id}
					id={draftConnectLine.id}
					points={draftConnectLine.points}
					theme={theme}
				/>
			) : null}
		</Layer>
	);
};

