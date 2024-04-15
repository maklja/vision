import { create } from 'zustand';
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

export const useStore = create<RootState>()((...rootState) => ({
	...createElementSlice(...rootState),
	...createStageSlice(...rootState),
	...createConnectPointSlice(...rootState),
	...createSelectSlice(...rootState),
	...createConnectLineSlice(...rootState),
	...createSnapLineSlice(...rootState),
	...createErrorSlice(...rootState),
	...createAnimationSlice(...rootState),
	...createSimulationSlice(...rootState),
}));
