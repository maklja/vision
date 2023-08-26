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

export const connectPointDrawConnectLineStateHandlers = (
	dispatch: AppDispatch,
): ConnectPointsDrawerEvents => ({
	onMouseUp: (cEvent: ConnectPointsDrawerEvent) => {
		const { id, element, connectPoint } = cEvent;
		dispatch(
			linkConnectLineDraw({
				targetId: id,
				targetPoint: element.center,
				targetConnectPointType: connectPoint.type,
				targetConnectPointPosition: connectPoint.position,
			}),
		);
		dispatch(removeAllDrawerAnimation({ drawerId: connectPoint.id }));
	},
	onMouseOver: (cEvent: ConnectPointsDrawerEvent) => {
		const { connectPoint, id } = cEvent;
		dispatch(
			pinConnectLine({
				elementId: id,
				position: {
					x: connectPoint.x,
					y: connectPoint.y,
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
