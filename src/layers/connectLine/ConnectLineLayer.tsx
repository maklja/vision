import { Group } from 'react-konva';
import { ConnectLineDrawer } from '../../drawers';
import { useAppSelector } from '../../store/rootState';
import {
	selectConnectLines,
	selectDraftConnectLine,
	useThemeContext,
} from '../../store/stageSlice';

export const ConnectLineLayer = () => {
	const themeContext = useThemeContext();
	const connectLines = useAppSelector(selectConnectLines);
	const draftConnectLine = useAppSelector(selectDraftConnectLine);

	return (
		<Group>
			{connectLines.map((cl) => (
				<ConnectLineDrawer key={cl.id} id={cl.id} points={cl.points} theme={themeContext} />
			))}
			{draftConnectLine ? (
				<ConnectLineDrawer
					key={draftConnectLine.id}
					id={draftConnectLine.id}
					points={draftConnectLine.points}
					theme={themeContext}
				/>
			) : null}
		</Group>
	);
};

