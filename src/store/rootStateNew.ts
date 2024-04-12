import { create } from 'zustand';
import { createElementSlice, ElementSlice } from './elements';
import { createStageSlice, StageSlice } from './stage';
import { ConnectPointSlice, createConnectPointSlice } from './connectPoints';
import { createSelectSlice, SelectSlice } from './select';
import { ConnectLineSlice, createConnectLineSlice } from './connectLines';
import { createSnapLineSlice, SnapLineSlice } from './snapLines';
import { createErrorSlice, ErrorSlice } from './errors/errorSlice';
import { AnimationSlice, createAnimationSlice } from './drawerAnimations';

export type RootState = ElementSlice &
	StageSlice &
	ConnectPointSlice &
	SelectSlice &
	ConnectLineSlice &
	SnapLineSlice &
	ErrorSlice &
	AnimationSlice;

export const useRootStore = create<RootState>()((...a) => ({
	...createElementSlice(...a),
	...createStageSlice(...a),
	...createConnectPointSlice(...a),
	...createSelectSlice(...a),
	...createConnectLineSlice(...a),
	...createSnapLineSlice(...a),
	...createErrorSlice(...a),
	...createAnimationSlice(...a),
}));

