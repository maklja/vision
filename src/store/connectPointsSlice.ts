import { createSlice, Draft } from '@reduxjs/toolkit';
import { ConnectPoint } from '../model';

export interface HighlightConnectPointsAction {
	type: string;
	payload: ConnectPoint[];
}

export interface ConnectPointsSlice {
	highlighted: ConnectPoint[];
}

const initialState: ConnectPointsSlice = {
	highlighted: [],
};

export const connectPointSlice = createSlice({
	name: 'connectPoints',
	initialState: initialState,
	reducers: {
		highlightConnectPoints: (
			slice: Draft<ConnectPointsSlice>,
			action: HighlightConnectPointsAction,
		) => {
			slice.highlighted = action.payload;
		},
	},
});

export const { highlightConnectPoints } = connectPointSlice.actions;

export default connectPointSlice.reducer;

