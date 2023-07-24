import { DrawerEvent, DrawerEvents } from '../../drawers';
import {
	removeDrawerAnimation,
	disposeDrawerAnimation,
} from '../../store/drawerAnimationsSlice';
import { AppDispatch } from '../../store/rootState';
import { changeState, moveElement, StageState } from '../../store/stageSlice';

export const drawerDragStateHandlers = (dispatch: AppDispatch): DrawerEvents => ({
	onDragEnd: (e: DrawerEvent) => {
		const { originalEvent } = e;
		if (originalEvent) {
			originalEvent.cancelBubble = true;
			dispatch(changeState(StageState.Select));
		}
	},
	onDragMove: (e: DrawerEvent) => {
		const { id, originalEvent } = e;
		if (originalEvent) {
			originalEvent.cancelBubble = true;
			const position = originalEvent.currentTarget.getAbsolutePosition();
			dispatch(
				moveElement({
					id,
					x: position.x,
					y: position.y,
				}),
			);
		}
	},
	onAnimationComplete: (aEvent) => {
		dispatch(
			disposeDrawerAnimation({ drawerId: aEvent.drawerId, animationId: aEvent.animationId }),
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
