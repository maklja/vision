import { create, StateCreator, StoreMutatorIdentifier } from 'zustand';
import { immer } from 'zustand/middleware/immer';
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

export type ImmerStateCreator<
	T,
	Mps extends [StoreMutatorIdentifier, unknown][] = [],
	Mcs extends [StoreMutatorIdentifier, unknown][] = [],
> = StateCreator<T, [...Mps, ['zustand/immer', never]], Mcs>;

export type MyAppStateCreator = ImmerStateCreator<RootState>;

// Defines the type of a function used to create a slice of the store. The
// slice has access to all the store's actions and state, but only returns
// the actions and state necessary for the slice.
export type SliceCreator<TSlice extends keyof RootState> = (
	...params: Parameters<MyAppStateCreator>
) => Pick<ReturnType<MyAppStateCreator>, TSlice>;

export const useStore = create<RootState>()(
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
);

