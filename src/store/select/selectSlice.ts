import { StateCreator } from 'zustand';
import { RootState } from '../rootStore';
import { useShallow } from 'zustand/react/shallow';
import { normalizeBoundingBox } from '../../model';
import { calculateShapeSizeBoundingBox, findElementSize } from '../../theme';

export interface SelectSlice {
	removeSelectedElements: () => void;
	clearAllSelectedElements: () => void;
	markElementAsSelected: (elId: string) => void;
	toggleElementSelection: (elementId: string) => void;
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
	clearAllSelectedElements: () => {
		const state = get();
		state.setSelectElements([]);
		state.deselectAllConnectLines();
		state.clearSelectedConnectPoints();
	},
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

		if (selectedElementIds.length === 0) {
			state.clearAllSelectedElements();
			return;
		}

		state.setSelectElements(selectedElementIds);
		state.setSelectElementsConnectPoints(selectedElementIds);
	},
});

export const selectElementsInSelection = () =>
	useShallow((state: RootState) =>
		Object.values(state.elements).filter((el) => state.selectedElements.includes(el.id)),
	);
