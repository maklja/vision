import { createContext, useContext } from 'react';
import { createStore, useStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { ConnectLine, Element } from '../model';
import { createElementSlice, ElementSlice } from './elements';
import { createStageSlice, StageSlice } from './stage';
import { ConnectPointSlice, createConnectPointSlice } from './connectPoints';
import { createSelectSlice, SelectSlice } from './select';
import { ConnectLineSlice, createConnectLineSlice } from './connectLines';
import { createSnapLineSlice, SnapLineSlice } from './snapLines';
import { createErrorSlice, ErrorSlice } from './errors/errorSlice';
import { AnimationSlice, createAnimationSlice } from './drawerAnimations';
import { createSimulationSlice, SimulationSlice } from './simulation';

export type RootState = ElementSlice &
	StageSlice &
	ConnectPointSlice &
	SelectSlice &
	ConnectLineSlice &
	SnapLineSlice &
	ErrorSlice &
	AnimationSlice &
	SimulationSlice;

export type RootStore = ReturnType<typeof createRootStore>;

export interface StorageBlob {
	elements: Element[];
	connectLines: ConnectLine[];
}

export const StoreContext = createContext<RootStore | null>(null);

export const createRootStore = (initProps?: Partial<RootState>) =>
	createStore<RootState>()(
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
			...initProps,
		})),
	);

export function useRootStore<T = RootState>(selector: (state: RootState) => T) {
	const store = useContext(StoreContext);

	if (!store) {
		throw new Error('Missing StoreContext.Provider in the tree.');
	}

	return useStore(store, selector);
}
