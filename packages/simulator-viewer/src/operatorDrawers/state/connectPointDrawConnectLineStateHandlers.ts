import { ConnectPointsDrawerEvent, ConnectPointsDrawerEvents } from '../../drawers';
import { RootState } from '../../store/rootStore';

const CANCEL_MOUSE_BUTTON_KEY = 2;

export const connectPointDrawConnectLineStateHandlers = (
	state: RootState,
): ConnectPointsDrawerEvents => ({
	onMouseDown: (cEvent: ConnectPointsDrawerEvent) => {
		cEvent.connectPoint.originalEvent.cancelBubble = true;
	},
	onMouseUp: (cEvent: ConnectPointsDrawerEvent) => {
		const { id, element, connectPoint } = cEvent;
		const { originalEvent, animation } = connectPoint;

		originalEvent.cancelBubble = true;
		if (
			originalEvent.evt.button !== CANCEL_MOUSE_BUTTON_KEY &&
			originalEvent.evt.buttons !== CANCEL_MOUSE_BUTTON_KEY
		) {
			state.clearSnapLines();
			return state.linkConnectLineDraw({
				connectPointId: connectPoint.id,
				targetId: id,
				targetPoint: element.center,
				targetConnectPointType: connectPoint.type,
				targetConnectPointPosition: connectPoint.position,
			});
		}

		state.unpinConnectLine({
			drawerId: id,
			animationId: animation?.id ?? null,
		});
	},
	onMouseMove: (cEvent: ConnectPointsDrawerEvent) => {
		const { connectPoint, id } = cEvent;
		state.pinConnectLine({
			elementId: id,
			connectPointId: connectPoint.id,
			connectPointBoundingBox: {
				x: connectPoint.boundingBox.x,
				y: connectPoint.boundingBox.y,
				width: connectPoint.boundingBox.width,
				height: connectPoint.boundingBox.height,
			},
		});
	},
	onMouseOver: (cEvent: ConnectPointsDrawerEvent) => {
		const { connectPoint, id } = cEvent;
		state.pinConnectLine({
			elementId: id,
			connectPointId: connectPoint.id,
			connectPointBoundingBox: {
				x: connectPoint.boundingBox.x,
				y: connectPoint.boundingBox.y,
				width: connectPoint.boundingBox.width,
				height: connectPoint.boundingBox.height,
			},
		});
	},
	onMouseOut: (cEvent: ConnectPointsDrawerEvent) => {
		const { connectPoint } = cEvent;
		state.unpinConnectLine({
			drawerId: connectPoint.id,
			animationId: connectPoint.animation?.id ?? null,
		});
	},
	onAnimationDestroy: (aEvent) => {
		state.removeDrawerAnimation({
			drawerId: aEvent.drawerId,
			animationId: aEvent.animationId,
		});
	},
});
