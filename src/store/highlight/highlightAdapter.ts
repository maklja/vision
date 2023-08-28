import { createEntityAdapter } from '@reduxjs/toolkit';

export interface HighlightElement {
	id: string;
}

const highlightAdapter = createEntityAdapter<HighlightElement>({
	selectId: (el) => el.id,
});

export const { selectAll: selectAllConnectLines, selectById: selectConnectLineById } =
	highlightAdapter.getSelectors();

export const createConnectLinesAdapterInitialState = (connectLines: ConnectLine[] = []) =>
	connectLinesAdapter.addMany(connectLinesAdapter.getInitialState(), connectLines);
