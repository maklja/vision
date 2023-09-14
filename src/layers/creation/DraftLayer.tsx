import { Layer } from 'react-konva';
import { LineDrawer, SnapLineDrawer } from '../../drawers';
import { useAppSelector } from '../../store/rootState';
import { useThemeContext } from '../../store/stageSlice';
import { selectStageDraftConnectLine } from '../../store/connectLines';
import { useLineSize } from '../../theme';
import { selectSnapLines } from '../../store/snapLines';

export const DraftLayer = () => {
	const theme = useThemeContext();
	const lineSize = useLineSize();
	const draftConnectLine = useAppSelector(selectStageDraftConnectLine);
	const snapLines = useAppSelector(selectSnapLines);

	return (
		<Layer>
			{draftConnectLine ? (
				<LineDrawer
					key={draftConnectLine.id}
					id={draftConnectLine.id}
					points={draftConnectLine.points}
					theme={theme}
					arrowVisible={false}
					size={lineSize}
				/>
			) : null}

			{snapLines.map((snapLine, i) => (
				<SnapLineDrawer key={i} theme={theme} points={snapLine.points} />
			))}
		</Layer>
	);
};

