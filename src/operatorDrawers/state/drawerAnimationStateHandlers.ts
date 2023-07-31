import { DrawerEvents } from '../../drawers';
import { disposeDrawerAnimation, removeDrawerAnimation } from '../../store/drawerAnimationsSlice';
import { AppDispatch } from '../../store/rootState';

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
