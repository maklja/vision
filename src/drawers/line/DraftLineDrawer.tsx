import { Line, Group } from 'react-konva';
import { Point } from '../../model';
import { Theme, useLineDrawerTheme } from '../../theme';

export interface DraftLineDrawerProps {
	points: Point[];
	theme: Theme;
	visible?: boolean;
}

export const DraftLineDrawer = ({ points, theme, visible = true }: DraftLineDrawerProps) => {
	const lineTheme = useLineDrawerTheme({}, theme);

	return (
		<Group visible={visible}>
			<Line
				{...lineTheme.line}
				perfectDrawEnabled={false}
				listening={false}
				points={points.flatMap((p) => [p.x, p.y])}
			/>
		</Group>
	);
};
