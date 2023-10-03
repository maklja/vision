import { LineDrawer } from '../../drawers';
import { ConnectLineEntity } from '../../store/connectLines';
import { isHighlighted } from '../../store/highlight';
import { useAppSelector } from '../../store/rootState';
import { useThemeContext } from '../../store/stageSlice';
import { useLineSize } from '../../theme';
import { useLineDrawerHandlers } from '../state';

export interface ConnectLineDrawerProps {
	connectLine: ConnectLineEntity;
	draggable: boolean;
}

export const ConnectLineDrawer = ({ connectLine, draggable }: ConnectLineDrawerProps) => {
	const theme = useThemeContext();
	const lineSize = useLineSize();
	const connectLineHandlers = useLineDrawerHandlers();
	const highlight = useAppSelector(isHighlighted(connectLine.id));

	return (
		<LineDrawer
			{...connectLineHandlers}
			id={connectLine.id}
			points={connectLine.points}
			size={lineSize}
			theme={theme}
			select={connectLine.select}
			highlight={highlight}
			draggable={draggable}
		/>
	);
};

