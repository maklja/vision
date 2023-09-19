import { Draft, createEntityAdapter } from '@reduxjs/toolkit';
import { ConnectPoint, Point } from '../../model';
import { StageSlice } from '../stageSlice';
import { RootState } from '../rootState';

export interface HighlightConnectPointsAction {
	type: string;
	payload: ConnectPoint[];
}

export interface PinConnectLineAction {
	type: string;
	payload: {
		elementId: string;
		position: Point;
	};
}

export interface ElementConnectPoints {
	id: string;
	connectPoints: ConnectPoint[];
}

const highlightedConnectPointsAdapter = createEntityAdapter<ElementConnectPoints>({
	selectId: (cp) => cp.id,
});

export const createHighlightedConnectPointsAdapterInitialState = () =>
	highlightedConnectPointsAdapter.getInitialState();

export const clearHighlightedConnectPointsStateChange = (slice: Draft<StageSlice>) => {
	slice.highlightedConnectPoints = highlightedConnectPointsAdapter.removeAll(
		slice.highlightedConnectPoints,
	);
};

export const highlightedConnectPointsAdapterReducers = {
	highlightConnectPoints: (slice: Draft<StageSlice>, action: HighlightConnectPointsAction) => {
		const connectPointsByElement = action.payload.reduce(
			(elementsConnectPoints: { [key in string]: ConnectPoint[] }, connectPoint) => ({
				[connectPoint.elementId]: [
					...(elementsConnectPoints[connectPoint.elementId] ?? []),
					connectPoint,
				],
			}),
			{},
		);

		slice.highlightedConnectPoints = highlightedConnectPointsAdapter.addMany(
			highlightedConnectPointsAdapter.removeAll(slice.highlightedConnectPoints),
			Object.entries(connectPointsByElement).map(([id, connectPoints]) => ({
				id,
				connectPoints,
			})),
		);
	},
	clearHighlightedConnectPoints: clearHighlightedConnectPointsStateChange,
	pinConnectLine: (slice: Draft<StageSlice>, action: PinConnectLineAction) => {
		if (!slice.draftConnectLine) {
			return;
		}

		const lastPoint = slice.draftConnectLine.points.at(-1);

		if (!lastPoint) {
			return;
		}
		lastPoint.x = action.payload.position.x;
		lastPoint.y = action.payload.position.y;
		slice.draftConnectLine.locked = true;
	},
	unpinConnectLine: (slice: Draft<StageSlice>) => {
		if (!slice.draftConnectLine) {
			return;
		}

		slice.draftConnectLine.locked = false;
	},
};

const globalHighlightConnectPointsSelector =
	highlightedConnectPointsAdapter.getSelectors<RootState>(
		(state) => state.stage.highlightedConnectPoints,
	);

export const selectHighlightedConnectPointsByElementId =
	(elementId: string) => (state: RootState) =>
		globalHighlightConnectPointsSelector.selectById(state, elementId)?.connectPoints ?? [];
