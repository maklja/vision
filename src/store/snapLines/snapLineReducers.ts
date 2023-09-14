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
		const snapLines = elementsBoundingBox
			.filter((bb) =>
				snapLinesDistances(bb, elBoundingBox).some(
					(snapLineDistance) => Math.abs(snapLineDistance) < 6,
				),
			)
			.flatMap((bb) => createSnapLines(bb, elBoundingBox))
			.filter((snapLine) => Math.abs(snapLine.distance) < 6);
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

