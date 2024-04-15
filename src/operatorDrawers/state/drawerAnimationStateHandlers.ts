import { DrawerEvents } from '../../drawers';
import { RootState } from '../../store/rootState';

export const drawerAnimationStateHandlers = (state: RootState): DrawerEvents => ({
	onAnimationComplete: (aEvent) => {
		state.disposeDrawerAnimation({
			drawerId: aEvent.drawerId,
			animationId: aEvent.animationId,
		});
	},
	onAnimationDestroy: (aEvent) => {
		state.removeDrawerAnimation({
			drawerId: aEvent.drawerId,
			animationId: aEvent.animationId,
		});
	},
});
