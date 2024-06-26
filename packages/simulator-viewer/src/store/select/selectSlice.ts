import { StateCreator } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { boundingBoxLinesIntersection, normalizeBoundingBox } from '@maklja/vision-simulator-model';
import { RootState } from '../rootStore';
import { calculateShapeSizeBoundingBox, findElementSize } from '../../theme';
import { clearSelectedConnectPoints } from '../connectPoints';
import { deselectAllConnectLines } from '../connectLines';
import { setSelectElements } from '../elements';

export interface SelectSlice {
	removeSelectedElements: () => void;
	clearAllSelectedElements: () => void;
	markElementAsSelected: (elementId: string) => void;
	toggleElementSelection: (elementId: string) => void;
	markConnectLineAsSelected: (connectLineId: string) => void;
	toggleConnectLineSelection: (connectLineId: string) => void;
	selectElementsInLassoBoundingBox: () => void;
}

export const createSelectSlice: StateCreator<RootState, [], [], SelectSlice> = (set, get) => ({
	removeSelectedElements: () => {
		const state = get();
		const elementIds = get().selectedElements;
		state.removeElements(elementIds);
		state.removeConnectLines(state.selectedConnectLines);
		state.removeElementsConnectPoints(elementIds);
		elementIds.forEach((elementId) => state.removeElementConnectLines({ elementId }));
	},
	clearAllSelectedElements: () => set((state) => clearAllSelectedElements(state), true),
	markElementAsSelected: (elId: string) => {
		const state = get();

		if (state.selectedElements.includes(elId)) {
			return;
		}

		state.setSelectElements([elId]);
		state.setSelectElementConnectPoint(elId);
	},
	toggleElementSelection: (elementId: string) => {
		const state = get();
		const isSelected = state.selectedElements.includes(elementId);
		if (isSelected) {
			state.deselectElement(elementId);
			state.deselectConnectPoints(elementId);
		} else {
			state.selectElement(elementId);
			state.selectConnectPoints(elementId);
		}
	},
	markConnectLineAsSelected: (connectLineId: string) => {
		const state = get();

		if (state.selectedConnectLines.includes(connectLineId)) {
			return;
		}

		state.setSelectConnectLines([connectLineId]);
	},
	toggleConnectLineSelection: (connectLineId: string) => {
		const state = get();
		const isSelected = state.selectedConnectLines.includes(connectLineId);
		if (isSelected) {
			state.deselectConnectLine(connectLineId);
		} else {
			state.selectConnectLine(connectLineId);
		}
	},
	selectElementsInLassoBoundingBox: () => {
		const state = get();
		const lassoBoundingBox = state.lassoSelection;
		if (!lassoBoundingBox) {
			return;
		}

		const normalizedLassoBB = normalizeBoundingBox(lassoBoundingBox);
		const selectedElementIds = Object.values(state.elements)
			.filter((el) => {
				const shapeSize = findElementSize(state.elementSizes, el.type);
				const elBoundingBox = calculateShapeSizeBoundingBox(
					{ x: el.x, y: el.y },
					shapeSize,
				);
				return elBoundingBox.intersects(normalizedLassoBB);
			})
			.map((el) => el.id);

		const selectedConnectLineIds = Object.values(state.connectLines)
			.filter((cl) => boundingBoxLinesIntersection(normalizedLassoBB, cl.points))
			.map((cl) => cl.id);

		if (selectedElementIds.length === 0 && selectedConnectLineIds.length === 0) {
			state.clearAllSelectedElements();
			return;
		}

		state.setSelectElements(selectedElementIds);
		state.setSelectElementsConnectPoints(selectedElementIds);
		state.setSelectConnectLines(selectedConnectLineIds);
	},
});

export function clearAllSelectedElements(state: RootState) {
	setSelectElements(state, []);
	deselectAllConnectLines(state);
	clearSelectedConnectPoints(state);

	return state;
}

export const selectElementsInSelection = () =>
	useShallow((state: RootState) =>
		Object.values(state.elements).filter((el) => state.selectedElements.includes(el.id)),
	);
