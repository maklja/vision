import { DrawerEvent, DrawerEvents } from '../../../drawers';
import {
	disposeDrawerAnimation,
	removeDrawerAnimation,
} from '../../../store/drawerAnimationsSlice';
import { AppDispatch } from '../../../store/rootState';
import {
	changeState,
	highlightElements,
	moveDrawer,
	selectElements,
	StageState,
} from '../../../store/stageSlice';
import { changeCursorStyle } from '../utils';

export const drawerSelectStateHandlers = (dispatch: AppDispatch): DrawerEvents => ({
	onMouseDown: (e: DrawerEvent) => {
		if (e.originalEvent) {
			e.originalEvent.cancelBubble = true;
		}
		dispatch(selectElements([e.id]));
	},
	onMouseOver: (e: DrawerEvent) => {
		const { id, originalEvent } = e;
		if (originalEvent) {
			originalEvent.cancelBubble = true;
			changeCursorStyle('pointer', originalEvent);
			dispatch(highlightElements([id]));
		}
	},
	onMouseOut: (e: DrawerEvent) => {
		const { originalEvent } = e;
		if (originalEvent) {
			originalEvent.cancelBubble = true;
			changeCursorStyle('default', originalEvent);
			dispatch(highlightElements([]));
		}
	},
	onDragStart: (e: DrawerEvent) => {
		if (e.originalEvent) {
			e.originalEvent.cancelBubble = true;
		}
		dispatch(changeState(StageState.Dragging));
	},
	onDragEnd: (e: DrawerEvent) => {
		if (e.originalEvent) {
			e.originalEvent.cancelBubble = true;
		}
		dispatch(changeState(StageState.Select));
	},
	onDragMove: (e: DrawerEvent) => {
		const { id, originalEvent } = e;
		if (originalEvent) {
			originalEvent.cancelBubble = true;
			const position = originalEvent.currentTarget.getAbsolutePosition();
			dispatch(
				moveDrawer({
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
