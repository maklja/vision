import Konva from 'konva';
import { useMemo } from 'react';
import { Line, Group, Circle } from 'react-konva';
import { Point, lineToPolygon, linesIntersection } from '../../model';
import { LineDrawerEvents } from '../DrawerProps';
import { LineSize, Theme, useLineDrawerTheme } from '../../theme';
import { LineArrow } from './LineArrow';

export interface LineDrawerProps extends LineDrawerEvents {
	id: string;
	points: Point[];
	size: LineSize;
	theme: Theme;
	visible?: boolean;
	highlight?: boolean;
	select?: boolean;
	arrowVisible?: boolean;
}

export const LineDrawer = ({
	id,
	points,
	size,
	theme,
	visible = true,
	select = false,
	highlight = false,
	arrowVisible = true,
	onMouseDown,
	onMouseUp,
	onMouseOut,
	onMouseOver,
}: LineDrawerProps) => {
	const lineTheme = useLineDrawerTheme({ select, highlight }, theme);

	const drawAnArrow = arrowVisible && points.length > 3;

	const boundingBoxPoints = useMemo(() => {
		const groupedPoints: [Point, Point, Point, Point][] = points.reduce(
			(groups: [Point, Point, Point, Point][], point, i) => {
				const nextPoint = points[i + 1];
				if (!nextPoint) {
					return groups;
				}

				const [pp0, pp1, pp2, pp3] = lineToPolygon(point, nextPoint);
				return [...groups, [pp0, pp1, pp2, pp3]];
			},
			[],
		);

		for (let i = 0; i < groupedPoints.length - 1; i++) {
			const [p00, p01, p02, p03] = groupedPoints[i];
			const [p10, p11, p12, p13] = groupedPoints[i + 1];

			const i0 = linesIntersection(p00, p01, p10, p11);
			const i1 = linesIntersection(p03, p02, p13, p12);

			groupedPoints.splice(i, 2, [p00, i0, i1, p03], [i0, p11, p12, i1]);
		}

		const topPoints = groupedPoints.flatMap(([p0, p1]) => [p0.x, p0.y, p1.x, p1.y]);
		const bottomPoints = groupedPoints
			.reverse()
			.flatMap(([, , p2, p3]) => [p2.x, p2.y, p3.x, p3.y]);
		return [...topPoints, ...bottomPoints];
	}, [points]);

	const handleMouseOver = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onMouseOver?.({
			id,
			originalEvent: e,
		});

	const handleMouseOut = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onMouseOut?.({
			id,
			originalEvent: e,
		});

	const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onMouseDown?.({
			id,
			originalEvent: e,
		});

	const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) =>
		onMouseUp?.({
			id,
			originalEvent: e,
		});

	return (
		<Group
			visible={visible}
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
			onMouseOver={handleMouseOver}
			onMouseOut={handleMouseOut}
		>
			<Line
				perfectDrawEnabled={false}
				points={boundingBoxPoints}
				closed={true}
				strokeWidth={0}
			/>

			<Line
				{...lineTheme.line}
				perfectDrawEnabled={false}
				listening={false}
				points={points.flatMap((p) => [p.x, p.y])}
			/>
			{drawAnArrow ? <LineArrow {...lineTheme.arrow} points={points} size={size} /> : null}

			{drawAnArrow
				? points
						.slice(2, -2)
						.map((p, i) => (
							<Circle
								{...lineTheme.dot}
								key={i}
								x={p.x}
								y={p.y}
								radius={size.dotSize}
							/>
						))
				: null}
		</Group>
	);
};

