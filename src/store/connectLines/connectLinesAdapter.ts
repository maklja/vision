import { createEntityAdapter } from '@reduxjs/toolkit';
import { ConnectLine } from '../../model';

export interface ConnectLineEntity extends ConnectLine {
	select: boolean;
}

const connectLinesAdapter = createEntityAdapter<ConnectLineEntity>({
	selectId: (el) => el.id,
});

export const { selectAll: selectAllConnectLines } = connectLinesAdapter.getSelectors();

export const createConnectLinesAdapterInitialState = () => connectLinesAdapter.getInitialState();

export const connectLinesAdapterReducers = {};

