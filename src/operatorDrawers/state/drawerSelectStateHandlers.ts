import { DrawerEvent, DrawerEvents } from '../../drawers';
import { RootState } from '../../store/rootStateNew';
import { StageState } from '../../store/stage';
import { changeCursorStyle } from '../utils';
import { drawerAnimationStateHandlers } from './drawerAnimationStateHandlers';

export function drawerSelectStateHandlers(state: RootState): DrawerEvents {
	return {
		...drawerAnimationStateHandlers,
		onMouseDown: (e: DrawerEvent) => {
			if (e.originalEvent) {
				e.originalEvent.cancelBubble = true;
			}

			if (e.originalEvent?.evt.ctrlKey) {
				state.toggleElementSelection(e.id);
			} else {
				state.markElementAsSelected(e.id);
			}
		},
		onMouseUp: (e: DrawerEvent) => {
			if (e.originalEvent?.evt.ctrlKey) {
				return;
			}

			state.clearAllSelectedElements();
			state.markElementAsSelected(e.id);
		},
		onMouseOver: (e: DrawerEvent) => {
			const { id, originalEvent } = e;
			if (originalEvent) {
				originalEvent.cancelBubble = true;
				changeCursorStyle('pointer', originalEvent.currentTarget.getStage());
				state.setHighlighted([id]);
				state.showTooltip({
					elementId: id,
				});
			}
		},
		onMouseOut: (e: DrawerEvent) => {
			const { originalEvent } = e;
			if (originalEvent) {
				originalEvent.cancelBubble = true;
				changeCursorStyle('default', originalEvent.currentTarget.getStage());
				state.setHighlighted([]);
				state.hideTooltip();
			}
		},
		onDragStart: (e: DrawerEvent) => {
			if (e.originalEvent) {
				e.originalEvent.cancelBubble = true;
			}

			state.changeState(StageState.Dragging);
		},
	};
}

