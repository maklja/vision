import { DrawerEvents } from '../../drawers';
import { AppDispatch } from '../../store/rootState';
import { disposeDrawerAnimation, removeDrawerAnimation } from '../../store/stageSlice';

export const drawerAnimationStateHandlers = (dispatch: AppDispatch): DrawerEvents => ({
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
