import { Draft } from '@reduxjs/toolkit';
import { StageSlice } from '../stageSlice';
import {
	ConnectPoint,
	Element,
	ElementType,
	Point,
	SnapLine,
	SnapLineOrientation,
	boundingBoxTouch,
	createBoundingBoxSnapLines,
	createPointSnapLines,
	snapLinesDistance,
} from '../../model';
import { RootState } from '../rootState';
import { moveElementStateChange, selectAllElements, selectElementById } from '../elements';
import { ElementSizesContext, calculateShapeSizeBoundingBox, findElementSize } from '../../theme';
import { selectAllConnectPoints, selectConnectPointById } from '../connectPoints';

const SNAP_DISTANCE = 4;

export interface CreateElementSnapLinesAction {
	type: string;
	payload: {
		referenceElementId: string;
	};
}

export const createSnapLinesInitialState = (): SnapLine[] => [];

export const clearSnapLinesStateChange = (slice: Draft<StageSlice>) => {
	slice.snapLines = [];
};

const createSnapLinesByElement = (
	el: Element,
	stageElements: Element[],
	elementSizes: ElementSizesContext,
) => {
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
		.reduce((snapLinesMap, snapLine) => {
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
		}, new Map<string, SnapLine>());
	const snapLines = [...snapLinesMap.values()];
	const horizontalSnapLines = snapLines
		.filter((snapLine) => snapLine.orientation === SnapLineOrientation.Horizontal)
		.sort(snapLinesDistance)
		.slice(0, 3)
		.reduce((snapLines: SnapLine[], snapLine) => {
			const hasDuplicateSnapLine = snapLines.some(
				(curSnapLine) => snapLinesDistance(curSnapLine, snapLine) <= SNAP_DISTANCE,
			);

			return hasDuplicateSnapLine ? snapLines : [...snapLines, snapLine];
		}, []);
	const verticalSnapLines = snapLines
		.filter((snapLine) => snapLine.orientation === SnapLineOrientation.Vertical)
		.sort((snapLine1, snapLine2) => Math.abs(snapLine1.distance) - Math.abs(snapLine2.distance))
		.slice(0, 3)
		.reduce((snapLines: SnapLine[], snapLine) => {
			const hasDuplicateSnapLine = snapLines.some(
				(curSnapLine) => snapLinesDistance(curSnapLine, snapLine) <= SNAP_DISTANCE,
			);

			return hasDuplicateSnapLine ? snapLines : [...snapLines, snapLine];
		}, []);

	return {
		horizontalSnapLines,
		verticalSnapLines,
	};
};

const createSnapLinesByConnectPoint = (
	p: Point,
	connectPoints: ConnectPoint[],
	elementSizes: ElementSizesContext,
) => {
	const shapeSize = findElementSize(elementSizes, ElementType.ConnectPoint);
	const connectPointsCenter = connectPoints
		.filter((cp) => cp.visible)
		.map((cp) => calculateShapeSizeBoundingBox({ x: cp.x, y: cp.y }, shapeSize).center);

	const snapLinesMap: Map<string, SnapLine> = connectPointsCenter
		.flatMap((curCpCenter) => createPointSnapLines(p, curCpCenter))
		.filter((snapLine) => Math.abs(snapLine.distance) < SNAP_DISTANCE)
		.reduce((snapLinesMap, snapLine) => {
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
		}, new Map<string, SnapLine>());

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
};

export const snapLineReducers = {
	clearSnapLines: (slice: Draft<StageSlice>) => clearSnapLinesStateChange(slice),
	createElementSnapLines: (
		slice: Draft<StageSlice>,
		{ payload }: CreateElementSnapLinesAction,
	) => {
		const el = selectElementById(slice.elements, payload.referenceElementId);
		if (!el) {
			return;
		}

		const elements = selectAllElements(slice.elements);
		const { horizontalSnapLines, verticalSnapLines } = createSnapLinesByElement(
			el,
			elements,
			slice.elementSizes,
		);

		slice.snapLines = [...horizontalSnapLines, ...verticalSnapLines];

		const [horizontalSnapLine] = horizontalSnapLines;
		const [verticalSnapLine] = verticalSnapLines;
		const x = verticalSnapLine ? el.x + verticalSnapLine.distance : el.x;
		const y = horizontalSnapLine ? el.y + horizontalSnapLine.distance : el.y;
		moveElementStateChange(slice, {
			id: el.id,
			x,
			y,
		});
	},
	createDraftElementSnapLines: (slice: Draft<StageSlice>) => {
		if (!slice.draftElement) {
			return;
		}

		const elements = selectAllElements(slice.elements);
		const { horizontalSnapLines, verticalSnapLines } = createSnapLinesByElement(
			slice.draftElement,
			elements,
			slice.elementSizes,
		);

		slice.snapLines = [...horizontalSnapLines, ...verticalSnapLines];
		const [horizontalSnapLine] = horizontalSnapLines;
		const [verticalSnapLine] = verticalSnapLines;
		const x = verticalSnapLine
			? slice.draftElement.x + verticalSnapLine.distance
			: slice.draftElement.x;
		const y = horizontalSnapLine
			? slice.draftElement.y + horizontalSnapLine.distance
			: slice.draftElement.y;
		slice.draftElement = {
			...slice.draftElement,
			x,
			y,
		};
	},
	createConnectPointSnapLines: (slice: Draft<StageSlice>) => {
		if (!slice.draftConnectLine) {
			return;
		}

		const { source, points } = slice.draftConnectLine;
		const el = selectConnectPointById(slice.connectPoints, source.id);
		if (!el) {
			return;
		}

		const cp = el.connectPoints.find((cp) => cp.position === source.connectPosition);
		if (!cp) {
			return;
		}

		const connectPoints = selectAllConnectPoints(slice.connectPoints)
			.flatMap((elConnectPoint) => elConnectPoint.connectPoints)
			.filter((curElementCp) => curElementCp.elementId !== cp.elementId);
		const { horizontalSnapLines, verticalSnapLines } = createSnapLinesByConnectPoint(
			points[points.length - 1],
			connectPoints,
			slice.elementSizes,
		);

		slice.snapLines = [...horizontalSnapLines, ...verticalSnapLines];

		const [horizontalSnapLine] = horizontalSnapLines;
		const [verticalSnapLine] = verticalSnapLines;
		const x = verticalSnapLine ? cp.x + verticalSnapLine.distance : cp.x;
		const y = horizontalSnapLine ? cp.y + horizontalSnapLine.distance : cp.y;
		// moveElementStateChange(slice, {
		// 	id: el.id,
		// 	x,
		// 	y,
		// });
	},
};

export const selectSnapLines = (state: RootState) => state.stage.snapLines;
