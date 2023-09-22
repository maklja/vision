import { AnimationKey } from '../../animation';
import { ConnectPointsDrawerEvent, ConnectPointsDrawerEvents } from '../../drawers';
import {
	refreshDrawerAnimation,
	removeDrawerAnimation,
	disposeDrawerAnimation,
	removeAllDrawerAnimation,
} from '../../store/drawerAnimationsSlice';
import { AppDispatch } from '../../store/rootState';
import { linkConnectLineDraw, pinConnectLine, unpinConnectLine } from '../../store/stageSlice';

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
			dispatch(
				linkConnectLineDraw({
					targetId: id,
					targetPoint: element.center,
					targetConnectPointType: connectPoint.type,
					targetConnectPointPosition: connectPoint.position,
				}),
			);
			return dispatch(removeAllDrawerAnimation({ drawerId: connectPoint.id }));
		}

		dispatch(unpinConnectLine());
		if (!animation) {
			return;
		}

		dispatch(
			disposeDrawerAnimation({
				drawerId: id,
				animationId: animation.id,
			}),
		);
	},
	onMouseMove: (cEvent: ConnectPointsDrawerEvent) => {
		const { connectPoint, id } = cEvent;
		dispatch(
			pinConnectLine({
				elementId: id,
				boundingBox: {
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
				boundingBox: {
					x: connectPoint.boundingBox.x,
					y: connectPoint.boundingBox.y,
					width: connectPoint.boundingBox.width,
					height: connectPoint.boundingBox.height,
				},
			}),
		);

		dispatch(
			refreshDrawerAnimation({
				drawerId: connectPoint.id,
				key: AnimationKey.SnapConnectPoint,
			}),
		);
	},
	onMouseOut: (cEvent: ConnectPointsDrawerEvent) => {
		dispatch(unpinConnectLine());

		const { connectPoint } = cEvent;
		const { animation } = connectPoint;
		if (!animation) {
			return;
		}

		dispatch(
			disposeDrawerAnimation({
				drawerId: connectPoint.id,
				animationId: animation.id,
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
