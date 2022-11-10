import { Group } from 'react-konva';
import { useSelector } from 'react-redux';
import { ConnectLineDrawer } from '../../drawers';
import { selectConnectLines, selectDraftConnectLine } from '../../store/stageSlice';

export const ConnectLineLayer = () => {
	const connectLines = useSelector(selectConnectLines);
	const draftConnectLine = useSelector(selectDraftConnectLine);

	return (
		<Group>
			{connectLines.map((cl) => (
				<ConnectLineDrawer key={cl.id} id={cl.id} points={cl.points} />
			))}
			{draftConnectLine ? (
				<ConnectLineDrawer
					key={draftConnectLine.id}
					id={draftConnectLine.id}
					points={draftConnectLine.points}
				/>
			) : null}
		</Group>
	);
};

