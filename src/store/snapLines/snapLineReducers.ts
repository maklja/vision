import { Draft } from '@reduxjs/toolkit';
import { StageSlice } from '../stageSlice';
import { SnapLine, SnapLineOrientation, createSnapLines, snapLinesDistances } from '../../model';
import { RootState } from '../rootState';
import { moveElementStateChange, selectAllElements, selectElementById } from '../elements';
import { calculateShapeSizeBoundingBox, findElementSize, scaleShapeSize } from '../../theme';

export interface CreateSnapLinesAction {
	type: string;
	payload: {
		referenceElementId: string;
	};
}

export const createSnapLinesInitialState = (): SnapLine[] => [];

export const clearSnapLinesStateChange = (slice: Draft<StageSlice>) => {
	slice.snapLines = [];
};

export const snapLineReducers = {
	clearSnapLines: (slice: Draft<StageSlice>) => clearSnapLinesStateChange(slice),
	createSnapLines: (slice: Draft<StageSlice>, { payload }: CreateSnapLinesAction) => {
		const el = selectElementById(slice.elements, payload.referenceElementId);
		if (!el) {
			return;
		}

		const shapeSize = scaleShapeSize(
			findElementSize(slice.elementSizes.sizes, el.type),
			el.scale,
		);
		const elBoundingBox = calculateShapeSizeBoundingBox({ x: el.x, y: el.y }, shapeSize);

		const elements = selectAllElements(slice.elements).filter(
			(currentElement) => currentElement.id !== payload.referenceElementId,
		);

		const elementsBoundingBox = elements.map((el) => {
			const shapeSize = scaleShapeSize(
				findElementSize(slice.elementSizes.sizes, el.type),
				el.scale,
			);
			return calculateShapeSizeBoundingBox({ x: el.x, y: el.y }, shapeSize);
		});

		// TODO better and remove hard coded values
		const snapLinesMap: Map<string, SnapLine> = elementsBoundingBox
			.flatMap((bb) => createSnapLines(bb, elBoundingBox))
			.filter((snapLine) => Math.abs(snapLine.distance) < 4)
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
		slice.snapLines = snapLines;

		if (snapLines.length === 0) {
			return;
		}

		const horizontalSnapLine = snapLines.find(
			(snapLine) => snapLine.orientation === SnapLineOrientation.Horizontal,
		);
		const verticalSnapLine = snapLines.find(
			(snapLine) => snapLine.orientation === SnapLineOrientation.Vertical,
		);

		const x = verticalSnapLine ? el.x + verticalSnapLine.distance : el.x;
		const y = horizontalSnapLine ? el.y + horizontalSnapLine.distance : el.y;
		moveElementStateChange(slice, {
			id: el.id,
			x,
			y,
		});
	},
};

export const selectSnapLines = (state: RootState) => state.stage.snapLines;
