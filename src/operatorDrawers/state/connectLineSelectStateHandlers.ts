import { LineDotEvent, LineDrawerEvents, LineEvent } from '../../drawers';
import { RootState } from '../../store/rootState';
import { StageState } from '../../store/stage';
import { changeCursorStyle } from '../utils';

export const connectLineSelectStateHandlers = (state: RootState): LineDrawerEvents => ({
	onMouseDown: (e: LineEvent) => {
		if (e.originalEvent) {
			e.originalEvent.cancelBubble = true;
		}

		state.clearAllSelectedElements();
		state.selectConnectLines([e.id]);
	},
	onMouseOver: (e: LineEvent) => {
		const { id, originalEvent } = e;
		if (originalEvent) {
			originalEvent.cancelBubble = true;
			changeCursorStyle('pointer', originalEvent.currentTarget.getStage());
			state.setHighlighted([id]);
		}
	},
	onMouseOut: (e: LineEvent) => {
		const { originalEvent } = e;
		if (originalEvent) {
			originalEvent.cancelBubble = true;
			changeCursorStyle('default', originalEvent.currentTarget.getStage());
			state.setHighlighted([]);
		}
	},
	onDotMouseDown: (e: LineDotEvent) => {
		const { originalEvent } = e;
		if (!originalEvent) {
			return;
		}
		originalEvent.cancelBubble = true;
	},
	onDotDragStart: (e: LineDotEvent) => {
		if (e.originalEvent) {
			e.originalEvent.cancelBubble = true;
		}

		state.changeState(StageState.Dragging);
	},
});
