import { LineDrawer } from '../../drawers';
import { ConnectLine } from '../../model';
import { isSelectedConnectLine } from '../../store/connectLines';
import { useAppSelector } from '../../store/rootState';
import { isHighlighted, useThemeContext } from '../../store/stageSlice';
import { useLineDrawerHandlers } from '../state';

export interface ConnectLineDrawerProps {
	connectLine: ConnectLine;
}

export const ConnectLineDrawer = ({ connectLine }: ConnectLineDrawerProps) => {
	const theme = useThemeContext();
	const connectLineHandlers = useLineDrawerHandlers();
	const select = useAppSelector(isSelectedConnectLine(connectLine.id));
	const highlight = useAppSelector(isHighlighted(connectLine.id));

	return (
		<LineDrawer
			{...connectLineHandlers}
			id={connectLine.id}
			points={connectLine.points}
			theme={theme}
			select={select}
			highlight={highlight}
		/>
	);
};

