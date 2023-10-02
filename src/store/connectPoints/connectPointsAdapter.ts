import { Draft, createEntityAdapter } from '@reduxjs/toolkit';
import { IBoundingBox, ConnectPoint, pointOverlapBoundingBox } from '../../model';
import { StageSlice } from '../stageSlice';
import { RootState } from '../rootState';
import { AnimationKey } from '../../animation';
import {
	disposeDrawerAnimationStateChange,
	refreshDrawerAnimationStateChange,
} from '../drawerAnimations';

export interface HighlightConnectPointsAction {
	type: string;
	payload: ConnectPoint[];
}

export interface PinConnectLineAction {
	type: string;
	payload: {
		elementId: string;
		connectPointId: string;
		connectPointBoundingBox: IBoundingBox;
	};
}

export interface UnpinConnectLineAction {
	type: string;
	payload: {
		drawerId: string;
		animationId: string | null;
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

		const { connectPointBoundingBox } = action.payload;
		const hasOverlap = pointOverlapBoundingBox(lastPoint, connectPointBoundingBox);

		if (!hasOverlap) {
			return;
		}

		lastPoint.x = connectPointBoundingBox.x + connectPointBoundingBox.width / 2;
		lastPoint.y = connectPointBoundingBox.y + connectPointBoundingBox.height / 2;
		slice.draftConnectLine.locked = true;

		refreshDrawerAnimationStateChange(slice, {
			drawerId: action.payload.connectPointId,
			key: AnimationKey.SnapConnectPoint,
		});
	},
	unpinConnectLine: (slice: Draft<StageSlice>, action: UnpinConnectLineAction) => {
		if (!slice.draftConnectLine) {
			return;
		}

		slice.draftConnectLine.locked = false;

		if (!action.payload.animationId) {
			return;
		}

		disposeDrawerAnimationStateChange(slice, {
			drawerId: action.payload.drawerId,
			animationId: action.payload.animationId,
		});
	},
};

const globalHighlightConnectPointsSelector =
	highlightedConnectPointsAdapter.getSelectors<RootState>(
		(state) => state.stage.highlightedConnectPoints,
	);

export const selectHighlightedConnectPointsByElementId =
	(elementId: string) => (state: RootState) =>
		globalHighlightConnectPointsSelector.selectById(state, elementId)?.connectPoints ?? [];
