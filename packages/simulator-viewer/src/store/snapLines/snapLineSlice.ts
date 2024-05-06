import { StateCreator } from 'zustand';
import {
	boundingBoxTouch,
	createBoundingBoxSnapLines,
	SnapLine,
	SnapLineOrientation,
	snapLinesDistance,
	Element,
	Point,
	ConnectPoint,
	ElementType,
	createPointSnapLines,
} from '@maklja/vision-simulator-model';
('../../model');
import { RootState } from '../rootStore';
import { calculateShapeSizeBoundingBox, ElementSizesContext, findElementSize } from '../../theme';

export const SNAP_DISTANCE = 6;

export function mergeSnapLines(snapLinesMap: Map<string, SnapLine>, snapLine: SnapLine) {
	const isHorizontal = snapLine.orientation === SnapLineOrientation.Horizontal;
	const [p0, p1] = snapLine.points;
	const coordinateValue = isHorizontal ? p0.y : p0.x;
	const snapLineId = `${snapLine.orientation}_${coordinateValue}`;
	const existingSnapLine = snapLinesMap.get(snapLineId);
	if (!existingSnapLine) {
		return snapLinesMap.set(snapLineId, snapLine);
	}

	const [p2, p3] = existingSnapLine.points;
	if (isHorizontal) {
		const x0 = Math.min(p0.x, p1.x, p2.x, p3.x);
		const x1 = Math.max(p0.x, p1.x, p2.x, p3.x);

		return snapLinesMap.set(snapLineId, {
			...existingSnapLine,
			length: Math.abs(x0 - x1),
			points: [
				{
					x: x0,
					y: p0.y,
				},
				{
					x: x1,
					y: p0.y,
				},
			],
		});
	}

	const y0 = Math.min(p0.y, p1.y, p2.y, p3.y);
	const y1 = Math.max(p0.y, p1.y, p2.y, p3.y);

	return snapLinesMap.set(snapLineId, {
		...existingSnapLine,
		length: Math.abs(y0 - y1),
		points: [
			{
				x: p0.x,
				y: y0,
			},
			{
				x: p0.x,
				y: y1,
			},
		],
	});
}

export function createSnapLinesByElement(
	el: Element,
	stageElements: Element[],
	elementSizes: ElementSizesContext,
) {
	const shapeSize = findElementSize(elementSizes, el.type);
	const elBoundingBox = calculateShapeSizeBoundingBox({ x: el.x, y: el.y }, shapeSize);

	const elements = stageElements.filter((currentElement) => currentElement.id !== el.id);

	const elementsBoundingBox = elements.map((el) => {
		const shapeSize = findElementSize(elementSizes, el.type);
		return calculateShapeSizeBoundingBox({ x: el.x, y: el.y }, shapeSize);
	});

	const snapLinesMap: Map<string, SnapLine> = elementsBoundingBox
		.filter((bb) => boundingBoxTouch(bb, elBoundingBox))
		.flatMap((bb) => createBoundingBoxSnapLines(bb, elBoundingBox))
		.filter((snapLine) => Math.abs(snapLine.distance) < SNAP_DISTANCE)
		.reduce(mergeSnapLines, new Map<string, SnapLine>());

	const snapLines = [...snapLinesMap.values()];
	const horizontalSnapLines = snapLines
		.filter((snapLine) => snapLine.orientation === SnapLineOrientation.Horizontal)
		.sort(snapLinesDistance)
		.slice(0, 3)
		.reduce((snapLines: SnapLine[], snapLine) => {
			const hasDuplicateSnapLine = snapLines.some(
				(curSnapLine) => snapLinesDistance(curSnapLine, snapLine) <= 2 * SNAP_DISTANCE,
			);

			return hasDuplicateSnapLine ? snapLines : [...snapLines, snapLine];
		}, []);
	const verticalSnapLines = snapLines
		.filter((snapLine) => snapLine.orientation === SnapLineOrientation.Vertical)
		.sort((snapLine1, snapLine2) => Math.abs(snapLine1.distance) - Math.abs(snapLine2.distance))
		.slice(0, 3)
		.reduce((snapLines: SnapLine[], snapLine) => {
			const hasDuplicateSnapLine = snapLines.some(
				(curSnapLine) => snapLinesDistance(curSnapLine, snapLine) <= 2 * SNAP_DISTANCE,
			);

			return hasDuplicateSnapLine ? snapLines : [...snapLines, snapLine];
		}, []);

	return {
		horizontalSnapLines,
		verticalSnapLines,
	};
}

export function createSnapLinesByConnectPoint(
	p: Point,
	connectPoints: ConnectPoint[],
	elementSizes: ElementSizesContext,
) {
	const shapeSize = findElementSize(elementSizes, ElementType.ConnectPoint);
	const connectPointsCenter = connectPoints.map(
		(cp) => calculateShapeSizeBoundingBox({ x: cp.x, y: cp.y }, shapeSize).center,
	);

	const snapLinesMap: Map<string, SnapLine> = connectPointsCenter
		.flatMap((curCpCenter) => createPointSnapLines(p, curCpCenter))
		.filter((snapLine) => Math.abs(snapLine.distance) < SNAP_DISTANCE)
		.reduce(mergeSnapLines, new Map<string, SnapLine>());

	const snapLines = [...snapLinesMap.values()];
	const horizontalSnapLines = snapLines
		.filter((snapLine) => snapLine.orientation === SnapLineOrientation.Horizontal)
		.sort(snapLinesDistance)
		.slice(0, 1);
	const verticalSnapLines = snapLines
		.filter((snapLine) => snapLine.orientation === SnapLineOrientation.Vertical)
		.sort((snapLine1, snapLine2) => Math.abs(snapLine1.distance) - Math.abs(snapLine2.distance))
		.slice(0, 1);
	return {
		horizontalSnapLines,
		verticalSnapLines,
	};
}

export interface SnapLineSlice {
	snapLines: SnapLine[];
	setSnapLines: (snapLines: SnapLine[]) => void;
	clearSnapLines: () => void;
}

export const createSnapLineSlice: StateCreator<RootState, [], [], SnapLineSlice> = (set) => ({
	snapLines: [],
	setSnapLines: (snapLines: SnapLine[]) => set((state) => setSnapLines(state, snapLines), true),
	clearSnapLines: () =>
		set((state) => {
			if (state.snapLines.length === 0) {
				return state;
			}
			state.snapLines = [];

			return state;
		}, true),
});

export function setSnapLines(state: RootState, snapLines: SnapLine[]) {
	state.snapLines = snapLines;

	return state;
}

export const selectSnapLines = (state: RootState) => state.snapLines;
