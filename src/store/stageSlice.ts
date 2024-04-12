import { createSlice } from '@reduxjs/toolkit';

export interface StageSlice {
	a: number;
}

export const createStageInitialState = (): StageSlice => ({
	a: 1,
});

export const stageSlice = createSlice({
	name: 'stage',
	initialState: createStageInitialState(),
	reducers: {},
});

export default stageSlice.reducer;

