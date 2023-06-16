import { ConnectPointsDrawerEvent, ConnectPointsDrawerEvents } from '../../../drawers';
import { AppDispatch } from '../../../store/rootState';
import { highlightConnectPoints, startConnectLineDraw } from '../../../store/stageSlice';

export const connectPointSelectStateHandlers = (
	dispatch: AppDispatch,
): ConnectPointsDrawerEvents => ({
	onMouseDown: (cEvent: ConnectPointsDrawerEvent) => {
		const { connectPoint, element, id } = cEvent;
		connectPoint.originalEvent.cancelBubble = true;

		dispatch(
			startConnectLineDraw({
				sourceId: id,
				points: [
					{ ...element.center },
					{ x: connectPoint.x, y: connectPoint.y },
					{ x: connectPoint.x, y: connectPoint.y },
				],
			}),
		);
	},
	onMouseOver: (cEvent: ConnectPointsDrawerEvent) => {
		const { connectPoint, id } = cEvent;
		connectPoint.originalEvent.cancelBubble = true;

		dispatch(
			highlightConnectPoints([
				{
					elementId: id,
					position: connectPoint.position,
					type: connectPoint.type,
				},
			]),
		);
	},
	onMouseOut: (cEvent: ConnectPointsDrawerEvent) => {
		cEvent.connectPoint.originalEvent.cancelBubble = true;
		dispatch(highlightConnectPoints([]));
	},
});

