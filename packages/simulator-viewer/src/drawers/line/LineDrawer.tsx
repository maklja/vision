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
	draggable?: boolean;
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
	draggable = true,
	onMouseDown,
	onMouseUp,
	onMouseOut,
	onMouseOver,
	onDotMouseDown,
	onDotMouseOut,
	onDotMouseOver,
	onDotDragStart,
	onDotDragEnd,
	onDotDragMove,
}: LineDrawerProps) => {
	const lineTheme = useLineDrawerTheme(theme, { select, highlight });
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

	const arrowPoints = useMemo(() => points.slice(points.length - 3, points.length - 1), [points]);

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

	const handleDotMouseDown = (pointIndex: number, e: Konva.KonvaEventObject<MouseEvent>) =>
		onDotMouseDown?.({
			id,
			originalEvent: e,
			index: pointIndex,
		});

	const handleDotMouseOver = (pointIndex: number, e: Konva.KonvaEventObject<MouseEvent>) =>
		onDotMouseOver?.({
			id,
			originalEvent: e,
			index: pointIndex,
		});

	const handleDotMouseOut = (pointIndex: number, e: Konva.KonvaEventObject<MouseEvent>) =>
		onDotMouseOut?.({
			id,
			originalEvent: e,
			index: pointIndex,
		});

	const handleDotDragStart = (pointIndex: number, e: Konva.KonvaEventObject<DragEvent>) =>
		onDotDragStart?.({
			id,
			originalEvent: e,
			index: pointIndex,
		});

	const handleDotDragEnd = (pointIndex: number, e: Konva.KonvaEventObject<DragEvent>) =>
		onDotDragEnd?.({
			id,
			originalEvent: e,
			index: pointIndex,
		});

	const handleDotDragMove = (pointIndex: number, e: Konva.KonvaEventObject<DragEvent>) =>
		onDotDragMove?.({
			id,
			originalEvent: e,
			index: pointIndex,
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
			{drawAnArrow ? (
				<LineArrow {...lineTheme.arrow} points={arrowPoints} size={size} />
			) : null}

			{select
				? points.slice(2, -2).map((p, i) => {
						const indexOffset = i + 2;
						return (
							<Circle
								{...lineTheme.dot}
								radius={size.dotSize}
								draggable={draggable}
								onMouseDown={(e) => handleDotMouseDown(indexOffset, e)}
								onMouseOver={(e) => handleDotMouseOver(indexOffset, e)}
								onMouseOut={(e) => handleDotMouseOut(indexOffset, e)}
								onDragStart={(e) => handleDotDragStart(indexOffset, e)}
								onDragEnd={(e) => handleDotDragEnd(indexOffset, e)}
								onDragMove={(e) => handleDotDragMove(indexOffset, e)}
								key={i}
								x={p.x}
								y={p.y}
							/>
						);
				  })
				: null}
		</Group>
	);
};

