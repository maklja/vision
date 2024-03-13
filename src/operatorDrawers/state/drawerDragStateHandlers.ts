import { DrawerEvent, DrawerEvents } from '../../drawers';
import { AppDispatch } from '../../store/rootState';
import { StageState } from '../../store/stage';
import {
	changeState,
	clearSnapLines,
	createElementSnapLines,
	moveSelectedElementsByDelta,
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
		const position = originalEvent.currentTarget.getPosition();
		dispatch(
			moveSelectedElementsByDelta({
				referenceElementId: id,
				x: position.x,
				y: position.y,
			}),
		);

		dispatch(createElementSnapLines({ referenceElementId: id }));
		dispatch(
			changeState(
				e.originalEvent?.evt.shiftKey ? StageState.SnapDragging : StageState.Dragging,
			),
		);
	},
});

