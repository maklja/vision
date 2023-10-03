import { ConnectPointsDrawerEvent, ConnectPointsDrawerEvents } from '../../drawers';
import { AppDispatch } from '../../store/rootState';
import {
	clearHighlighConnectPoints,
	startConnectLineDraw,
	updateManyConnectPoints,
} from '../../store/stageSlice';

export const connectPointSelectStateHandlers = (
	dispatch: AppDispatch,
): ConnectPointsDrawerEvents => ({
	onMouseDown: (cEvent: ConnectPointsDrawerEvent) => {
		const { connectPoint, element, id } = cEvent;
		connectPoint.originalEvent.cancelBubble = true;

		const { boundingBox } = connectPoint;
		const { center } = boundingBox;
		dispatch(
			startConnectLineDraw({
				sourceId: id,
				type: connectPoint.type,
				position: connectPoint.position,
				points: [
					{ ...element.center },
					{ x: center.x, y: center.y },
					{ x: center.x, y: center.y },
				],
			}),
		);
	},
	onMouseOver: (cEvent: ConnectPointsDrawerEvent) => {
		const { connectPoint, id } = cEvent;
		connectPoint.originalEvent.cancelBubble = true;

		dispatch(
			updateManyConnectPoints({
				connectPointUpdates: [
					{
						id,
						highlight: {
							[connectPoint.position]: true,
						},
					},
				],
			}),
		);
	},
	onMouseOut: (cEvent: ConnectPointsDrawerEvent) => {
		cEvent.connectPoint.originalEvent.cancelBubble = true;
		dispatch(clearHighlighConnectPoints());
	},
});

