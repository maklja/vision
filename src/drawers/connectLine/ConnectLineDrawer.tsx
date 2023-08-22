import { Line, Group } from 'react-konva';
import { Point, Vector } from '../../model';
import { Theme } from '../../theme';
import { ConnectLineArrow } from './ConnectLineArrow';
import { useMemo } from 'react';

interface BoundingBoxLines {
	topLines: Vector[];
	bottomLines: Vector[];
}

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
		// const groupedPoints: [Point, Point][] = points.reduce(
		// 	(groups: [Point, Point][], point, i) => {
		// 		const nextPoint = points[i + 1];
		// 		if (!nextPoint) {
		// 			return groups;
		// 		}

		// 		return [...groups, [point, nextPoint]];
		// 	},
		// 	[],
		// );

		const groupedPoints1: [Point, Point, Point, Point][] = points.reduce(
			(groups: [Point, Point, Point, Point][], point, i) => {
				const nextPoint = points[i + 1];
				if (!nextPoint) {
					return groups;
				}

				const [pp0, pp1, pp2, pp3] = createPolygon(point, nextPoint);
				return [...groups, [pp0, pp1, pp2, pp3]];
			},
			[],
		);

		for (let i = 0; i < groupedPoints1.length - 1; i++) {
			const [p00, p01, p02, p03] = groupedPoints1[i];
			const [p10, p11, p12, p13] = groupedPoints1[i + 1];

			const i0 = findIntersection(p00, p01, p10, p11);
			const i1 = findIntersection(p03, p02, p13, p12);

			groupedPoints1.splice(i, 2, [p00, i0, i1, p03], [i0, p11, i1, p12]);
		}

		const topPoints = groupedPoints1.flatMap(([p0, p1]) => [p0.x, p0.y, p1.x, p1.y]);
		const bottomPoints = groupedPoints1.flatMap(([, , p2, p3]) => [p3.x, p3.y, p2.x, p2.y]);
		return [...topPoints, ...bottomPoints];

		// groupedPoints1.reduce((groups: [Point, Point, Point, Point][], points, i) => {

		// 	const nextPoint = groupedPoints1[i + 1];
		// 	if (!nextPoint) {
		// 		return groups;
		// 	}

		// 	const [pp0, pp1, pp2, pp3] = createPolygon(point, nextPoint);
		// 	return [...groups, [pp0, pp1, pp2, pp3]];
		// }, []);

		// const { topLines, bottomLines } = groupedPoints.reduce(
		// 	(
		// 		lines: {
		// 			topLines: Vector[];
		// 			bottomLines: Vector[];
		// 		},
		// 		[p0, p1],
		// 	) => {
		// 		const [pp0, pp1, pp2, pp3] = createPolygon(p0, p1);
		// 		const prevTopLine = lines.topLines.pop();
		// 		const prevBottomLine = lines.bottomLines.pop();

		// 		if (prevTopLine) {
		// 			const interPoint = findIntersection(prevTopLine.p0, prevTopLine.p1, pp0, pp1);
		// 		}

		// 		return {
		// 			topLines: [
		// 				...lines.topLines,
		// 				{
		// 					p0: pp0,
		// 					p1: pp1,
		// 				},
		// 			],
		// 			bottomLines: [
		// 				...lines.bottomLines,
		// 				{
		// 					p0: pp3,
		// 					p1: pp2,
		// 				},
		// 			],
		// 		};
		// 	},
		// 	{ topLines: [], bottomLines: [] },
		// );

		// return groupedPoints.map(([p0, p1]) => createPolygon(p0, p1).flatMap((p) => [p.x, p.y]));
	}, [points]);

	return (
		<Group visible={visible}>
			<Line
				{...theme.connectLine.line}
				perfectDrawEnabled={false}
				points={boundingBoxPoints}
				closed={false}
			/>

			{/* <Line
				{...theme.connectLine.line}
				perfectDrawEnabled={false}
				points={points.flatMap((p) => [p.x, p.y])}
			/>
			{drawAnArrow ? <ConnectLineArrow {...theme.connectLine.arrow} points={points} /> : null} */}
		</Group>
	);
};
