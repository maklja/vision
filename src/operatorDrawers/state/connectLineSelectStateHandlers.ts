import { LineDrawerEvents, LineEvent } from '../../drawers';
import { AppDispatch } from '../../store/rootState';
import {
	highlightElements,
	selectConnectLinesNew,
} from '../../store/stageSlice';
import { changeCursorStyle } from '../utils';

export const connectLineSelectStateHandlers = (dispatch: AppDispatch): LineDrawerEvents => ({
	onMouseDown: (e: LineEvent) => {
		if (e.originalEvent) {
			e.originalEvent.cancelBubble = true;
		}

		dispatch(selectConnectLinesNew({ connectLineIds: [e.id] }));
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

