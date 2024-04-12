import { LineDrawer } from '../../drawers';
import { ConnectLine } from '../../model';
import { useRootStore, useThemeContext } from '../../store/rootStateNew';
import { isHighlighted } from '../../store/stage';
import { useLineSize } from '../../theme';
import { useLineDrawerHandlers } from '../state';

export interface ConnectLineDrawerProps {
	connectLine: ConnectLine;
	select: boolean;
	draggable: boolean;
}

export const ConnectLineDrawer = ({ connectLine, select, draggable }: ConnectLineDrawerProps) => {
	const theme = useThemeContext();
	const lineSize = useLineSize();
	const connectLineHandlers = useLineDrawerHandlers();
	const highlight = useRootStore(isHighlighted(connectLine.id));

	return (
		<LineDrawer
			{...connectLineHandlers}
			id={connectLine.id}
			points={connectLine.points}
			size={lineSize}
			theme={theme}
			select={select}
			highlight={highlight}
			draggable={draggable}
		/>
	);
};

