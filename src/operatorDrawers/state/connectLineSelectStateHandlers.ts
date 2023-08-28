import { LineDrawerEvents, LineEvent } from '../../drawers';
import { AppDispatch } from '../../store/rootState';
import { clearSelected, highlight, selectConnectLines } from '../../store/stageSlice';
import { changeCursorStyle } from '../utils';

export const connectLineSelectStateHandlers = (dispatch: AppDispatch): LineDrawerEvents => ({
	onMouseDown: (e: LineEvent) => {
		if (e.originalEvent) {
			e.originalEvent.cancelBubble = true;
		}

		dispatch(clearSelected());
		dispatch(selectConnectLines([{ id: e.id }]));
	},
	onMouseOver: (e: LineEvent) => {
		const { id, originalEvent } = e;
		if (originalEvent) {
			originalEvent.cancelBubble = true;
			changeCursorStyle('pointer', originalEvent.currentTarget.getStage());
			dispatch(highlight([{ id }]));
		}
	},
	onMouseOut: (e: LineEvent) => {
		const { originalEvent } = e;
		if (originalEvent) {
			originalEvent.cancelBubble = true;
			changeCursorStyle('default', originalEvent.currentTarget.getStage());
			dispatch(highlight([]));
		}
	},
});

