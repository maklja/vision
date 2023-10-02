import { Draft } from '@reduxjs/toolkit';
import { StageSlice } from '../stageSlice';
import {
	removeElementsStateChange,
	selectElementsStateChange,
	selectSelectedElementEntities,
} from '../elements';
import {
	removeConnectLinesStateChange,
	selectAllConnectLines,
	selectAllSelectedConnectLines,
	selectConnectLinesStateChange,
} from '../connectLines';
import {
	clearSelectionConnectPointsStateChange,
	removeConnectPointsByIdsStateChange,
} from '../connectPoints';

export const clearSelectedStateChange = (slice: Draft<StageSlice>) => {
	selectElementsStateChange(slice, []);
	selectConnectLinesStateChange(slice, []);
	clearSelectionConnectPointsStateChange(slice);
};

export const removeSelectedStateChange = (slice: Draft<StageSlice>) => {
	const selectedElements = selectSelectedElementEntities(slice.selectedElements);
	const elementIds = Object.keys(selectedElements);
	removeElementsStateChange(slice, { elementIds });

	const connectLineIds = selectAllConnectLines(slice.connectLines)
		.filter((cl) => selectedElements[cl.source.id] || selectedElements[cl.target.id])
		.map((cl) => cl.id);

	const selectConnectLineIds = selectAllSelectedConnectLines(slice.selectedConnectLines).map(
		(cl) => cl.id,
	);

	removeConnectLinesStateChange(slice, {
		connectLineIds: [...connectLineIds, ...selectConnectLineIds],
	});
	removeConnectPointsByIdsStateChange(slice, {
		elementIds,
	});
};

export const selectReducers = {
	removeSelected: removeSelectedStateChange,
	clearSelected: clearSelectedStateChange,
};

