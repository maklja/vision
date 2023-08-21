import { Line, Group } from 'react-konva';
import { Point } from '../../model';
import { Theme } from '../../theme';
import { ConnectLineArrow } from './ConnectLineArrow';
import { useMemo } from 'react';

export interface ConnectLineDrawerProps {
	id: string;
	points: Point[];
	theme: Theme;
	visible?: boolean;
}

const findIntersection = (p0: Point, p1: Point, p2: Point, p3: Point): Point => {
	const slope1 = (p1.y - p0.y) / (p1.x - p0.x);
	const yIntercept1 = p0.y - slope1 * p0.x;

	const slope2 = (p3.y - p2.y) / (p3.x - p2.x);
	const yIntercept2 = p2.y - slope2 * p2.x;

	const x = (yIntercept2 - yIntercept1) / (slope1 - slope2);
	const y = slope1 * x + yIntercept1;

	return { x, y };
};

const createPolygon = (p0: Point, p1: Point, thickness = 15): Point[] => {
	const dx = p1.x - p0.x;
	const dy = p1.y - p0.y;
	const lineLength = Math.sqrt(dx * dx + dy * dy);

	const directionX = dx / lineLength;
	const directionY = dy / lineLength;

	const px = 0.5 * thickness * directionY * -1;
	const py = 0.5 * thickness * directionX;

	return [
		{
			x: p0.x + px,
			y: p0.y + py,
		},
		{
			x: p1.x + px,
			y: p1.y + py,
		},
		{
			x: p1.x - px,
			y: p1.y - py,
		},
		{
			x: p0.x - px,
			y: p0.y - py,
		},
	];
};

export const ConnectLineDrawer = ({ points, theme, visible = true }: ConnectLineDrawerProps) => {
	const drawAnArrow = points.length > 3;

	const boundingBoxPoints = useMemo(() => {
		const groupedPoints: [Point, Point][] = points.reduce(
			(groups: [Point, Point][], point, i) => {
				const nextPoint = points[i + 1];
				if (!nextPoint) {
					return groups;
				}

				return [...groups, [point, nextPoint]];
			},
			[],
		);

		return groupedPoints.map(([p0, p1]) => createPolygon(p0, p1).flatMap((p) => [p.x, p.y]));
	}, [points]);

	return (
		<Group visible={visible}>
			{boundingBoxPoints.map((points, i) => (
				<Line
					{...theme.connectLine.line}
					key={i}
					perfectDrawEnabled={false}
					points={points}
				/>
			))}

			<Line
				{...theme.connectLine.line}
				perfectDrawEnabled={false}
				points={points.flatMap((p) => [p.x, p.y])}
			/>
			{drawAnArrow ? <ConnectLineArrow {...theme.connectLine.arrow} points={points} /> : null}
		</Group>
	);
};

