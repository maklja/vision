import { Line, Group } from 'react-konva';
import { Point } from '../../model';
import { useDrawerTheme } from '../../store/stageSlice';
import { ConnectLineArrow } from './ConnectLineArrow';

export interface ConnectLineDrawerProps {
	id: string;
	points: Point[];
}

export const ConnectLineDrawer = (props: ConnectLineDrawerProps) => {
	const theme = useDrawerTheme();
	const drawAnArrow = props.points.length > 3;

	return (
		<Group>
			<Line
				{...theme.connectLine.line}
				perfectDrawEnabled={false}
				points={props.points.flatMap((p) => [p.x, p.y])}
			/>
			{drawAnArrow ? (
				<ConnectLineArrow {...theme.connectLine.arrow} points={props.points} />
			) : null}
		</Group>
	);
};

