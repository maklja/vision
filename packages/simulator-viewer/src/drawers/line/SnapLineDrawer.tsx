import { Line, Group } from 'react-konva';
import { Point } from '@maklja/vision-simulator-model';
import { Theme, useSnapLineDrawerTheme } from '../../theme';

export interface SnapLineDrawerProps {
	points: Point[];
	theme: Theme;
	visible?: boolean;
}

export function SnapLineDrawer({ points, theme, visible = true }: SnapLineDrawerProps) {
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
}

