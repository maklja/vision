import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ConnectLine, Element } from '../model';
import { createElementSlice, ElementSlice } from './elements';
import { createStageSlice, StageSlice } from './stage';
import { ConnectPointSlice, createConnectPoints, createConnectPointSlice } from './connectPoints';
import { createSelectSlice, SelectSlice } from './select';
import { ConnectLineSlice, createConnectLineSlice } from './connectLines';
import { createSnapLineSlice, SnapLineSlice } from './snapLines';
import { createErrorSlice, ErrorSlice } from './errors/errorSlice';
import { AnimationSlice, createAnimationSlice } from './drawerAnimations';
import { createSimulationSlice, SimulationSlice } from './simulation';

export type RootStore = ElementSlice &
	StageSlice &
	ConnectPointSlice &
	SelectSlice &
	ConnectLineSlice &
	SnapLineSlice &
	ErrorSlice &
	AnimationSlice &
	SimulationSlice;

export interface StorageBlob {
	elements: Element[];
	connectLines: ConnectLine[];
}

function loadStorageData(persistedState: StorageBlob, currentState: RootStore) {
	persistedState.elements.forEach((el) => {
		currentState.elements[el.id] = el;
		currentState.connectPoints[el.id] = createConnectPoints(el, currentState.elementSizes);
	});
	persistedState.connectLines.forEach((cl) => {
		currentState.connectLines[cl.id] = cl;
	});

	return currentState;
}

export const useStore = create<RootStore>()(
	persist<RootStore, [], [['zustand/immer', never]], StorageBlob>(
		immer((...args) => ({
			...createElementSlice(...args),
			...createStageSlice(...args),
			...createConnectPointSlice(...args),
			...createSelectSlice(...args),
			...createConnectLineSlice(...args),
			...createSnapLineSlice(...args),
			...createErrorSlice(...args),
			...createAnimationSlice(...args),
			...createSimulationSlice(...args),
		})),
		{
			name: 'elements-storage',
			storage: createJSONStorage(() => sessionStorage),
			partialize: (state) => ({
				elements: Object.values(state.elements),
				connectLines: Object.values(state.connectLines),
			}),
			merge: (persistedState, currentState) =>
				loadStorageData(persistedState as StorageBlob, currentState),
		},
	),
);

