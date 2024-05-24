import { DrawerEvents } from '../../drawers';
import { RootState } from '../../store/rootStore';

export const drawerAnimationStateHandlers = (state: RootState): DrawerEvents => ({
	onAnimationComplete: (aEvent) => {
		state.disposeDrawerAnimation({
			drawerId: aEvent.drawerId,
			animationId: aEvent.animationId,
		});
	},
	onAnimationDestroy: (aEvent) => {
		state.destroyDrawerAnimation({
			drawerId: aEvent.drawerId,
			animationId: aEvent.animationId,
			animationGroupId: aEvent.animationGroupId,
		});
	},
});

