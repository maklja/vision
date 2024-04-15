import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createElementSlice, ElementSlice } from './elements';
import { createStageSlice, StageSlice } from './stage';
import { ConnectPointSlice, createConnectPointSlice } from './connectPoints';
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

export const useStore = create<RootStore>()(
	persist(
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
		},
	),
);

