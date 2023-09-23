import { ConnectPointsDrawerEvent, ConnectPointsDrawerEvents } from '../../drawers';
import { AppDispatch } from '../../store/rootState';
import {
	linkConnectLineDraw,
	pinConnectLine,
	removeDrawerAnimation,
	unpinConnectLine,
} from '../../store/stageSlice';

const CANCEL_MOUSE_BUTTON_KEY = 2;

export const connectPointDrawConnectLineStateHandlers = (
	dispatch: AppDispatch,
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
			return dispatch(
				linkConnectLineDraw({
					connectPointId: connectPoint.id,
					targetId: id,
					targetPoint: element.center,
					targetConnectPointType: connectPoint.type,
					targetConnectPointPosition: connectPoint.position,
				}),
			);
		}

		dispatch(
			unpinConnectLine({
				drawerId: id,
				animationId: animation?.id ?? null,
			}),
		);
	},
	onMouseMove: (cEvent: ConnectPointsDrawerEvent) => {
		const { connectPoint, id } = cEvent;
		dispatch(
			pinConnectLine({
				elementId: id,
				connectPointId: connectPoint.id,
				connectPointBoundingBox: {
					x: connectPoint.boundingBox.x,
					y: connectPoint.boundingBox.y,
					width: connectPoint.boundingBox.width,
					height: connectPoint.boundingBox.height,
				},
			}),
		);
	},
	onMouseOver: (cEvent: ConnectPointsDrawerEvent) => {
		const { connectPoint, id } = cEvent;
		dispatch(
			pinConnectLine({
				elementId: id,
				connectPointId: connectPoint.id,
				connectPointBoundingBox: {
					x: connectPoint.boundingBox.x,
					y: connectPoint.boundingBox.y,
					width: connectPoint.boundingBox.width,
					height: connectPoint.boundingBox.height,
				},
			}),
		);
	},
	onMouseOut: (cEvent: ConnectPointsDrawerEvent) => {
		const { connectPoint } = cEvent;
		dispatch(
			unpinConnectLine({
				drawerId: connectPoint.id,
				animationId: connectPoint.animation?.id ?? null,
			}),
		);
	},
	onAnimationDestroy: (aEvent) => {
		dispatch(
			removeDrawerAnimation({
				drawerId: aEvent.drawerId,
				animationId: aEvent.animationId,
			}),
		);
	},
});
