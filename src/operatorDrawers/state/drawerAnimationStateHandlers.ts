import { DrawerEvents } from '../../drawers';
import { RootStore } from '../../store/rootStore';

export const drawerAnimationStateHandlers = (state: RootStore): DrawerEvents => ({
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

