import { DrawerEvent, DrawerEvents } from '../../drawers';
import { AppDispatch } from '../../store/rootState';
import { StageState } from '../../store/stage';
import {
	changeState,
	clearSnapLines,
	createElementSnapLines,
	moveElement,
} from '../../store/stageSlice';
import { changeCursorStyle } from '../utils';
import { drawerAnimationStateHandlers } from './drawerAnimationStateHandlers';

export const drawerDragStateHandlers = (dispatch: AppDispatch): DrawerEvents => ({
	...drawerAnimationStateHandlers,
	onDragEnd: (e: DrawerEvent) => {
		const { originalEvent } = e;
		if (!originalEvent) {
			return;
		}

		changeCursorStyle('pointer', originalEvent.currentTarget.getStage());
		originalEvent.cancelBubble = true;
		dispatch(changeState(StageState.Select));
		dispatch(clearSnapLines());
	},
	onDragMove: (e: DrawerEvent) => {
		const { id, originalEvent } = e;
		if (!originalEvent) {
			return;
		}

		changeCursorStyle('grabbing', originalEvent.currentTarget.getStage());
		originalEvent.cancelBubble = true;
		const snapToGrid = Boolean(e.originalEvent?.evt.shiftKey);
		const position = originalEvent.currentTarget.getPosition();
		dispatch(
			moveElement({
				id,
				x: position.x,
				y: position.y,
			}),
		);

		if (!snapToGrid) {
			dispatch(createElementSnapLines({ referenceElementId: id }));
			dispatch(changeState(StageState.Dragging));
		} else {
			dispatch(clearSnapLines());
			dispatch(changeState(StageState.SnapDragging));
		}
	},
});

