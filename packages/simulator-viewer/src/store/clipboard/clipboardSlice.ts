import { v1 } from 'uuid';
import { ConnectLine, Element, Point } from '@maklja/vision-simulator-model';
import { StateCreator } from 'zustand';
import { RootState } from '../rootStore';
import { calculateShapeSizeBoundingBox, findElementSize } from '../../theme';
import { createElementConnectPoints } from '../connectPoints';
import { addConnectLine } from '../connectLines';
import { addElement } from '../elements';

export interface ClipboardSlice {
	clipboard: {
		elements: Element[];
		connectLines: ConnectLine[];
	};
	copySelected: () => void;
	pasteSelected: (position: Point) => void;
}

export const createClipboardSlice: StateCreator<RootState, [], [], ClipboardSlice> = (set) => ({
	clipboard: {
		elements: [],
		connectLines: [],
	},
	copySelected: () =>
		set((state) => {
			const { elements, connectLines, selectedElements, selectedConnectLines, clipboard } =
				state;

			const connectLinesToCopy = selectedConnectLines.map((clId) => connectLines[clId]);
			const connectLineElements = connectLinesToCopy.reduce(
				(elToCopy: Record<string, Element>, cl) => ({
					...elToCopy,
					[cl.source.id]: elements[cl.source.id],
					[cl.target.id]: elements[cl.target.id],
				}),
				{},
			);
			const elementToCopy = selectedElements.reduce(
				(elToCopy, elId) => ({ ...elToCopy, [elId]: elements[elId] }),
				connectLineElements,
			);

			clipboard.elements = Object.values(elementToCopy);
			clipboard.connectLines = connectLinesToCopy;

			return state;
		}),
	pasteSelected: (position: Point) =>
		set((state) => {
			if (state.clipboard.elements.length === 0) {
				return state;
			}

			const [firstEl] = state.clipboard.elements;
			const shapeSize = findElementSize(state.elementSizes, firstEl.type);
			const elBoundingBox = calculateShapeSizeBoundingBox(
				{ x: firstEl.x, y: firstEl.y },
				shapeSize,
			);
			const elementsBB = state.clipboard.elements.reduce((bb, el) => {
				const shapeSize = findElementSize(state.elementSizes, el.type);
				const elBoundingBox = calculateShapeSizeBoundingBox(
					{ x: el.x, y: el.y },
					shapeSize,
				);

				return bb.union(elBoundingBox);
			}, elBoundingBox);
			const pasteRelativeToPosition = elementsBB.center;

			const copiedElements = new Map<string, string>();

			state.selectedElements = [];
			state.clipboard.elements.forEach((el) => {
				const xDistance = el.x - pasteRelativeToPosition.x;
				const yDistance = el.y - pasteRelativeToPosition.y;

				const elCopy = {
					...el,
					id: v1(),
					x: position.x + xDistance,
					y: position.y + yDistance,
				};
				copiedElements.set(el.id, elCopy.id);

				addElement(state, elCopy);
				createElementConnectPoints(state, elCopy);
				state.selectedElements.push(elCopy.id);
			});

			state.selectedConnectLines = [];
			state.clipboard.connectLines.forEach((cl) => {
				const points = cl.points.map((p) => {
					const xDistance = p.x - pasteRelativeToPosition.x;
					const yDistance = p.y - pasteRelativeToPosition.y;
					return { x: position.x + xDistance, y: position.y + yDistance };
				});

				const sourceElId = copiedElements.get(cl.source.id);
				const targetElId = copiedElements.get(cl.target.id);

				if (!sourceElId || !targetElId) {
					console.error(
						`Missing connect line element(s), source element id ${sourceElId}, target element id ${targetElId}`,
					);
					return;
				}

				const clCopy: ConnectLine = {
					...cl,
					id: v1(),
					points,
					source: {
						...cl.source,
						id: sourceElId,
					},
					target: {
						...cl.target,
						id: targetElId,
					},
				};

				addConnectLine(state, clCopy);
				state.selectedConnectLines.push(clCopy.id);
			});

			return state;
		}),
});

