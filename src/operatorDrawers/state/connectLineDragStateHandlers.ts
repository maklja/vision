import { LineDotEvent, LineDrawerEvents } from '../../drawers';
import { AppDispatch } from '../../store/rootState';
import { StageState } from '../../store/stage';
import { changeState, movePointConnectLine } from '../../store/stageSlice';
import { changeCursorStyle } from '../utils';

export const connectLineDragStateHandlers = (dispatch: AppDispatch): LineDrawerEvents => ({
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
		dispatch(changeState(StageState.Select));
	},
	onDotDragMove: (e: LineDotEvent<DragEvent>) => {
		const { id, originalEvent, index } = e;
		if (!originalEvent) {
			return;
		}

		changeCursorStyle('grabbing', originalEvent.currentTarget.getStage());
		originalEvent.cancelBubble = true;
		const position = originalEvent.currentTarget.getPosition();
		dispatch(
			movePointConnectLine({
				id,
				index,
				x: position.x,
				y: position.y,
			}),
		);
	},
});

