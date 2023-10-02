import { DrawerEvent, DrawerEvents } from '../../drawers';
import { AppDispatch } from '../../store/rootState';
import { StageState } from '../../store/stage';
import {
	changeState,
	clearSelected,
	hideTooltip,
	highlight,
	selectElements,
	setSelectionConnectPoints,
	showTooltip,
} from '../../store/stageSlice';
import { changeCursorStyle } from '../utils';
import { drawerAnimationStateHandlers } from './drawerAnimationStateHandlers';

export const drawerSelectStateHandlers = (dispatch: AppDispatch): DrawerEvents => ({
	...drawerAnimationStateHandlers,
	onMouseDown: (e: DrawerEvent) => {
		if (e.originalEvent) {
			e.originalEvent.cancelBubble = true;
		}

		dispatch(clearSelected());
		dispatch(selectElements([{ id: e.id }]));
		dispatch(setSelectionConnectPoints({ elementIds: [e.id] }));
	},
	onMouseOver: (e: DrawerEvent) => {
		const { id, originalEvent } = e;
		if (originalEvent) {
			originalEvent.cancelBubble = true;
			changeCursorStyle('pointer', originalEvent.currentTarget.getStage());
			dispatch(highlight([{ id }]));
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
			changeCursorStyle('default', originalEvent.currentTarget.getStage());
			dispatch(highlight([]));
			dispatch(hideTooltip());
		}
	},
	onDragStart: (e: DrawerEvent) => {
		if (e.originalEvent) {
			e.originalEvent.cancelBubble = true;
		}
		dispatch(changeState(StageState.Dragging));
	},
});

