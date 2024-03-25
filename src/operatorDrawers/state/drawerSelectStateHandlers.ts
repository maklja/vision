import { DrawerEvent, DrawerEvents } from '../../drawers';
import { AppDispatch } from '../../store/rootState';
import { StageState } from '../../store/stage';
import {
	changeState,
	clearSelected,
	hideTooltip,
	highlight,
	selectConnectPoint,
	selectElement,
	selectElements,
	setSelectionConnectPoints,
	showTooltip,
	toggleSelectElement,
	toggleSelectionConnectPoint,
} from '../../store/stageSlice';
import { changeCursorStyle } from '../utils';
import { drawerAnimationStateHandlers } from './drawerAnimationStateHandlers';

export function drawerSelectStateHandlers(dispatch: AppDispatch): DrawerEvents {
	return {
		...drawerAnimationStateHandlers,
		onMouseDown: (e: DrawerEvent) => {
			if (e.originalEvent) {
				e.originalEvent.cancelBubble = true;
			}

			if (e.originalEvent?.evt.ctrlKey) {
				dispatch(toggleSelectElement({ id: e.id }));
				dispatch(toggleSelectionConnectPoint({ elementId: e.id }));
			} else {
				// here order matters so be aware that connect points are checking if
				// element that they belong to is selected as well
				dispatch(selectConnectPoint({ elementId: e.id }));
				dispatch(selectElement({ id: e.id }));
			}
		},
		onMouseUp: (e: DrawerEvent) => {
			if (e.originalEvent?.evt.ctrlKey) {
				return;
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
	};
}

