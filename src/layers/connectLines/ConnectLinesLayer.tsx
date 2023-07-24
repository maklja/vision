import { Layer } from 'react-konva';
import { ConnectLineDrawer } from '../../drawers';
import { useAppSelector } from '../../store/rootState';
import {
	selectConnectLines,
	selectDraftConnectLine,
	useThemeContext,
} from '../../store/stageSlice';

export const ConnectLinesLayer = () => {
	const theme = useThemeContext();
	const connectLines = useAppSelector(selectConnectLines);
	const draftConnectLine = useAppSelector(selectDraftConnectLine);

	return (
		<Layer>
			{connectLines.map((cl) => (
				<ConnectLineDrawer key={cl.id} id={cl.id} points={cl.points} theme={theme} />
			))}
			{draftConnectLine ? (
				<ConnectLineDrawer
					key={draftConnectLine.id}
					id={draftConnectLine.id}
					points={draftConnectLine.points}
					theme={theme}
				/>
			) : null}
		</Layer>
	);
};
