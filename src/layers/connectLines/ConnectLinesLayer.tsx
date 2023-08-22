import { Layer } from 'react-konva';
import { LineDrawer } from '../../drawers';
import { useAppSelector } from '../../store/rootState';
import {
	selectConnectLines,
	selectDraftConnectLine,
	useThemeContext,
} from '../../store/stageSlice';
import { ConnectLineDrawer } from '../../operatorDrawers';

export const ConnectLinesLayer = () => {
	const theme = useThemeContext();
	const connectLines = useAppSelector(selectConnectLines);
	const draftConnectLine = useAppSelector(selectDraftConnectLine);

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

