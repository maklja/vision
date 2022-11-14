import { Line, Group } from 'react-konva';
import { Point } from '../../model';
import { ThemeContext } from '../../theme';
import { ConnectLineArrow } from './ConnectLineArrow';

export interface ConnectLineDrawerProps {
	id: string;
	points: Point[];
	theme: ThemeContext;
}

export const ConnectLineDrawer = ({ points, theme }: ConnectLineDrawerProps) => {
	const drawAnArrow = points.length > 3;

	return (
		<Group>
			<Line
				{...theme.connectLine.line}
				perfectDrawEnabled={false}
				points={points.flatMap((p) => [p.x, p.y])}
			/>
			{drawAnArrow ? <ConnectLineArrow {...theme.connectLine.arrow} points={points} /> : null}
		</Group>
	);
};

