import { Line, Group } from 'react-konva';
import { Point } from '../../model';
import { LineSize, Theme, useLineDrawerTheme } from '../../theme';
import { LineArrow } from './LineArrow';
import { useMemo } from 'react';

export interface DraftLineDrawerProps {
	points: Point[];
	theme: Theme;
	size: LineSize;
	visible?: boolean;
	arrowVisible?: boolean;
}

export const DraftLineDrawer = ({
	points,
	theme,
	size,
	visible = true,
	arrowVisible = false,
}: DraftLineDrawerProps) => {
	const lineTheme = useLineDrawerTheme(theme);

	const arrowPoints = useMemo(() => points.slice(-2), [points]);
	const drawArrow = arrowVisible && arrowPoints.length > 1;
	return (
		<Group visible={visible}>
			<Line
				{...lineTheme.line}
				perfectDrawEnabled={false}
				listening={false}
				points={points.flatMap((p) => [p.x, p.y])}
			/>

			{drawArrow ? <LineArrow {...lineTheme.arrow} points={arrowPoints} size={size} /> : null}
		</Group>
	);
};

