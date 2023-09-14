import { Line, Group } from 'react-konva';
import { Point } from '../../model';
import { Theme, useLineDrawerTheme } from '../../theme';

export interface SnapLineDrawerProps {
	points: Point[];
	theme: Theme;
	visible?: boolean;
}

export const SnapLineDrawer = ({ points, theme, visible = true }: SnapLineDrawerProps) => {
	const lineTheme = useLineDrawerTheme({}, theme);

	return (
		<Group visible={visible}>
			<Line
				{...lineTheme.line}
				perfectDrawEnabled={false}
				listening={false}
				points={points.flatMap((p) => [p.x, p.y])}
				dash={[8, 3]} // TODO theme
			/>
		</Group>
	);
};

