import { Line, Group } from 'react-konva';
import { Point } from '../../model';
import { Theme, useSnapLineDrawerTheme } from '../../theme';

export interface SnapLineDrawerProps {
	points: Point[];
	theme: Theme;
	visible?: boolean;
}

export const SnapLineDrawer = ({ points, theme, visible = true }: SnapLineDrawerProps) => {
	const snapLineTheme = useSnapLineDrawerTheme(theme);

	return (
		<Group visible={visible}>
			<Line
				{...snapLineTheme.line}
				perfectDrawEnabled={false}
				listening={false}
				points={points.flatMap((p) => [p.x, p.y])}
			/>
		</Group>
	);
};

