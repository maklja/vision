import { Draft } from '@reduxjs/toolkit';
import { StageSlice, StageState } from '../stageSlice';

export const removeSelectedElementsReducer = (slice: Draft<StageSlice>) => {
	// const selectedElementIds = slice.selectedElements.map((s) => s.id);
	// slice.elements = slice.elements.filter((el) => !selectedElementIds.includes(el.id));
	// slice.connectLines = slice.connectLines.filter(
	// 	(cl) =>
	// 		!selectedElementIds.includes(cl.source.id) &&
	// 		!selectedElementIds.includes(cl.target.id),
	// );
};
