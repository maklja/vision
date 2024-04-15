import { ConnectPointsDrawerEvent, ConnectPointsDrawerEvents } from '../../drawers';
import { RootStore } from '../../store/rootStore';

export const connectPointSelectStateHandlers = (state: RootStore): ConnectPointsDrawerEvents => ({
	onMouseDown: (cEvent: ConnectPointsDrawerEvent) => {
		const { connectPoint, element, id } = cEvent;
		connectPoint.originalEvent.cancelBubble = true;

		const { boundingBox } = connectPoint;
		const { center } = boundingBox;
		state.startConnectLineDraw({
			sourceId: id,
			type: connectPoint.type,
			position: connectPoint.position,
			points: [
				{ ...element.center },
				{ x: center.x, y: center.y },
				{ x: center.x, y: center.y },
			],
		});
	},
	onMouseOver: (cEvent: ConnectPointsDrawerEvent) => {
		const { connectPoint, id } = cEvent;
		connectPoint.originalEvent.cancelBubble = true;

		state.updateConnectPoints({
			connectPointUpdates: [
				{
					id,
					highlight: {
						[connectPoint.position]: true,
					},
				},
			],
		});
	},
	onMouseOut: (cEvent: ConnectPointsDrawerEvent) => {
		cEvent.connectPoint.originalEvent.cancelBubble = true;
		state.clearHighlightConnectPoints();
	},
});

