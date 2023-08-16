import { DrawerEvent, DrawerEvents } from '../../drawers';
import { AppDispatch } from '../../store/rootState';
import {
	changeState,
	hideTooltip,
	highlightElements,
	moveElement,
	selectElements,
	showTooltip,
	StageState,
} from '../../store/stageSlice';
import { changeCursorStyle } from '../utils';
import { drawerAnimationStateHandlers } from './drawerAnimationStateHandlers';

export const drawerSelectStateHandlers = (dispatch: AppDispatch): DrawerEvents => ({
	...drawerAnimationStateHandlers,
	onMouseDown: (e: DrawerEvent) => {
		if (e.originalEvent) {
			e.originalEvent.cancelBubble = true;
		}

		dispatch(selectElements([{ id: e.id, visibleConnectPoints: { input: false } }]));
	},
	onMouseOver: (e: DrawerEvent) => {
		const { id, originalEvent } = e;
		if (originalEvent) {
			originalEvent.cancelBubble = true;
			changeCursorStyle('pointer', originalEvent);
			dispatch(highlightElements([id]));
			dispatch(
				showTooltip({
					elementId: id,
				}),
			);
		}
	},
	onMouseOut: (e: DrawerEvent) => {
		const { originalEvent } = e;
		if (originalEvent) {
			originalEvent.cancelBubble = true;
			changeCursorStyle('default', originalEvent);
			dispatch(highlightElements([]));
			dispatch(hideTooltip());
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
			const position = originalEvent.currentTarget.getPosition();
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

