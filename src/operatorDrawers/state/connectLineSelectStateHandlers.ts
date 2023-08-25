import { LineDrawerEvents, LineEvent } from '../../drawers';
import { AppDispatch } from '../../store/rootState';
import { highlightElements, selectConnectLines } from '../../store/stageSlice';
import { changeCursorStyle } from '../utils';

export const connectLineSelectStateHandlers = (dispatch: AppDispatch): LineDrawerEvents => ({
	onMouseDown: (e: LineEvent) => {
		if (e.originalEvent) {
			e.originalEvent.cancelBubble = true;
		}

		dispatch(selectConnectLines([{ id: e.id }]));
	},
	onMouseOver: (e: LineEvent) => {
		const { id, originalEvent } = e;
		if (originalEvent) {
			originalEvent.cancelBubble = true;
			changeCursorStyle('pointer', originalEvent);
			dispatch(highlightElements([id]));
		}
	},
	onMouseOut: (e: LineEvent) => {
		const { originalEvent } = e;
		if (originalEvent) {
			originalEvent.cancelBubble = true;
			changeCursorStyle('default', originalEvent);
			dispatch(highlightElements([]));
		}
	},
});

