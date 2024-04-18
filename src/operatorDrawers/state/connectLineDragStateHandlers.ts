import { LineDotEvent, LineDrawerEvents } from '../../drawers';
import { RootState } from '../../store/rootStore';
import { StageState } from '../../store/stage';
import { changeCursorStyle } from '../utils';

export const connectLineDragStateHandlers = (state: RootState): LineDrawerEvents => ({
	onDotMouseDown: (e: LineDotEvent) => {
		const { originalEvent } = e;
		if (!originalEvent) {
			return;
		}
		originalEvent.cancelBubble = true;
	},
	onDotDragEnd: (e: LineDotEvent<DragEvent>) => {
		const { originalEvent } = e;
		if (!originalEvent) {
			return;
		}

		changeCursorStyle('pointer', originalEvent.currentTarget.getStage());
		originalEvent.cancelBubble = true;
		state.changeState(StageState.Select);
	},
	onDotDragMove: (e: LineDotEvent<DragEvent>) => {
		const { id, originalEvent, index } = e;
		if (!originalEvent) {
			return;
		}

		changeCursorStyle('grabbing', originalEvent.currentTarget.getStage());
		originalEvent.cancelBubble = true;
		const position = originalEvent.currentTarget.getPosition();
		state.movePointConnectLine({
			id,
			index,
			x: position.x,
			y: position.y,
			normalizePosition: originalEvent.evt.shiftKey,
		});
	},
});
