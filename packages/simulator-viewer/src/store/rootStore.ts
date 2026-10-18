import { createContext, useContext } from 'react';
import { createStore, useStore } from 'zustand';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
	ConnectLine,
	Element,
	DiagramData,
	validateContextSeed,
} from '@maklja/vision-simulator-model';
import { createElementSlice, ElementSlice } from './elements';
import { createStageSlice, StageSlice } from './stage';
import { ConnectPointSlice, createConnectPointSlice } from './connectPoints';
import { createSelectSlice, SelectSlice } from './select';
import { ConnectLineSlice, createConnectLineSlice } from './connectLines';
import { createSnapLineSlice, SnapLineSlice } from './snapLines';
import { createErrorSlice, ErrorSlice } from './errors/errorSlice';
import { AnimationSlice, createAnimationSlice } from './drawerAnimations';
import { createSimulationSlice, SimulationSlice } from './simulation';
import { ClipboardSlice, createClipboardSlice } from './clipboard';

export type StateProps = DiagramData;

export type RootState = {
	/** Validation for mounted parameter drafts only; never serialized. */
	parameterDraftErrors: Record<string, string>;
	setParameterDraftError: (id: string, field: string, error: string) => void;
	contextSeed: Record<string, unknown>;
	setContextSeed: (seed: unknown) => void;
} & ElementSlice &
	StageSlice &
	ConnectPointSlice &
	SelectSlice &
	ConnectLineSlice &
	SnapLineSlice &
	ErrorSlice &
	AnimationSlice &
	SimulationSlice &
	ClipboardSlice;

export type RootStore = ReturnType<typeof createRootStore>;

export interface StorageBlob {
	elements: Element[];
	connectLines: ConnectLine[];
}

export const StoreContext = createContext<RootStore | null>(null);

export function createRootStore(initProps?: Partial<StateProps>) {
	const elements = initProps?.elements ?? [];
	const connectLInes = initProps?.connectLines ?? [];
	const canvasState = initProps?.canvasState ?? { x: 0, y: 0, scaleX: 1, scaleY: 1 };

	const store = createStore<RootState>()(
		devtools(
			immer(
				subscribeWithSelector((...args) => ({
					parameterDraftErrors: {},
					setParameterDraftError: (id, field, error) =>
						args[0]((state) => {
							const key = JSON.stringify([id, field]);
							if (error) state.parameterDraftErrors[key] = error;
							else delete state.parameterDraftErrors[key];
						}),
					contextSeed: initProps?.contextSeed ?? {},
					setContextSeed: (seed) =>
						args[0]((state) => {
							state.contextSeed = validateContextSeed(seed);
						}),
					...createElementSlice(...args),
					...createConnectLineSlice(...args),
					...createConnectPointSlice(...args),
					...createStageSlice(...args),
					...createSelectSlice(...args),
					...createSnapLineSlice(...args),
					...createErrorSlice(...args),
					...createAnimationSlice(...args),
					...createSimulationSlice(...args),
					...createClipboardSlice(...args),
				})),
			),
			{ name: 'SimulatorStore' },
		),
	);
	store.getState().changeTheme(initProps?.themeId);
	store.getState().load(elements, connectLInes);
	store.getState().updateCanvasState(canvasState);
	return store;
}

export function useRootStore(): RootState;
export function useRootStore<T = RootState>(selector?: (state: RootState) => T): T;
export function useRootStore<T = RootState>(
	selector?: (state: RootState) => T,
	qualityFn?: (state: T, prevState: T) => boolean,
): T;
export function useRootStore<T = RootState>(
	selector?: (state: RootState) => T,
	qualityFn?: (state: T, prevState: T) => boolean,
): T {
	const store = useContext(StoreContext);

	if (!store) {
		throw new Error('Missing StoreContext.Provider in the tree.');
	}

	if (!selector) {
		return useStore(store, (state) => state as T);
	}

	return useStoreWithEqualityFn(store, selector, qualityFn);
}
