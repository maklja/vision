import { LineDrawer } from '../../drawers';
import { ConnectLine } from '../../model';
import { isSelectedConnectLine } from '../../store/connectLines';
import { isHighlighted } from '../../store/highlight';
import { useAppSelector } from '../../store/rootState';
import { useThemeContext } from '../../store/stageSlice';
import { useLineSize } from '../../theme';
import { useLineDrawerHandlers } from '../state';

export interface ConnectLineDrawerProps {
	connectLine: ConnectLine;
}

export const ConnectLineDrawer = ({ connectLine }: ConnectLineDrawerProps) => {
	const theme = useThemeContext();
	const lineSize = useLineSize();
	const connectLineHandlers = useLineDrawerHandlers();
	const select = useAppSelector(isSelectedConnectLine(connectLine.id));
	const highlight = useAppSelector(isHighlighted(connectLine.id));

	return (
		<LineDrawer
			{...connectLineHandlers}
			id={connectLine.id}
			points={connectLine.points}
			size={lineSize}
			theme={theme}
			select={select}
			highlight={highlight}
		/>
	);
};

