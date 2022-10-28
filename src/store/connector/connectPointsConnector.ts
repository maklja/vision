import Konva from 'konva';
import { ConnectPointsDrawerEvent } from '../../drawers';
import { AppDispatch } from '../rootState';
import {
	startConnectLineDraw,
	pinConnectLine,
	unpinConnectLine,
	linkConnectLineDraw,
	StageState,
	highlightConnectPoints,
} from '../stageSlice';

const selectStateDispatch = (dispatch: AppDispatch) => ({
	onMouseDown: (cEvent: ConnectPointsDrawerEvent, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		const { x, y } = cEvent.element.center;
		dispatch(
			startConnectLineDraw({
				sourceId: cEvent.id,
				targetId: null,
				points: [
					{ x, y },
					{ x: cEvent.connectPoint.x, y: cEvent.connectPoint.y },
					{ x: cEvent.connectPoint.x, y: cEvent.connectPoint.y },
				],
				locked: false,
			}),
		);
	},
	onMouseOver: (cEvent: ConnectPointsDrawerEvent, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		dispatch(
			highlightConnectPoints([
				{
					elementId: cEvent.id,
					type: cEvent.connectPoint.type,
				},
			]),
		);
	},
	onMouseOut: (_: ConnectPointsDrawerEvent, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		dispatch(highlightConnectPoints([]));
	},
});

const drawConnectLineDispatch = (dispatch: AppDispatch) => ({
	onMouseUp: (cEvent: ConnectPointsDrawerEvent, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		dispatch(linkConnectLineDraw({ targetId: cEvent.id }));
	},
	onMouseOver: (cEvent: ConnectPointsDrawerEvent, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		cEvent.connectPoint.animations?.snapConnectPoint.play();
		dispatch(
			pinConnectLine({
				elementId: cEvent.id,
				position: {
					x: cEvent.connectPoint.x,
					y: cEvent.connectPoint.y,
				},
			}),
		);
	},
	onMouseOut: (cEvent: ConnectPointsDrawerEvent, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		cEvent.connectPoint.animations?.snapConnectPoint.reset();
		dispatch(unpinConnectLine());
	},
});

export const connectPointsConnector = (state: StageState) => {
	if (state === StageState.Select) {
		return selectStateDispatch;
	}

	if (state === StageState.DrawConnectLine) {
		return drawConnectLineDispatch;
	}

	return () => ({});
};
