import { ConnectLine, Element } from '@maklja/vision-simulator-model';
import { StateCreator } from 'zustand';
import { RootState } from '../rootStore';

export interface ClipboardSlice {
	clipboard: {
		elements: Element[];
		connectLines: ConnectLine[];
	};
	copySelected: () => void;
	pasteSelected: () => void;
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

			clipboard.elements = selectedElements.map((elId) => elements[elId]);
			clipboard.connectLines = selectedConnectLines
				.map((clId) => connectLines[clId])
				.filter(
					(cl) =>
						selectedElements.includes(cl.source.id) &&
						selectedElements.includes(cl.target.id),
				);

			return state;
		}),
	pasteSelected: () =>
		set((state) => {
			console.log([...state.clipboard.elements], [...state.clipboard.connectLines]);

			return state;
		}),
});

