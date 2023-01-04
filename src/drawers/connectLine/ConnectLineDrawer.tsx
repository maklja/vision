import { Line, Group } from 'react-konva';
import { Point } from '../../model';
import { ThemeContext } from '../../theme';
import { ConnectLineArrow } from './ConnectLineArrow';

export interface ConnectLineDrawerProps {
	id: string;
	points: Point[];
	theme: ThemeContext;
	visible?: boolean;
}

export const ConnectLineDrawer = ({ points, theme, visible = true }: ConnectLineDrawerProps) => {
	const drawAnArrow = points.length > 3;

	return (
		<Group visible={visible}>
			<Line
				{...theme.connectLine.line}
				perfectDrawEnabled={false}
				points={points.flatMap((p) => [p.x, p.y])}
			/>
			{drawAnArrow ? <ConnectLineArrow {...theme.connectLine.arrow} points={points} /> : null}
		</Group>
	);
};
