import { DrawerEvent, DrawerEvents } from '../../drawers';
import { AppDispatch } from '../../store/rootState';
import { changeState, moveElement, StageState } from '../../store/stageSlice';
import { drawerAnimationStateHandlers } from './drawerAnimationStateHandlers';

export const drawerDragStateHandlers = (dispatch: AppDispatch): DrawerEvents => ({
	...drawerAnimationStateHandlers,
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
});
