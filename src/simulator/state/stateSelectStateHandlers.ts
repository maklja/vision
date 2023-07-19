import Konva from 'konva';
import { AppDispatch } from '../../store/rootState';

export const stateSelectStateHandlers = (dispatch: AppDispatch): DrawerEvents => ({
	onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
	},
	onMouseOver: (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
	},
	onMouseOut: (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
	},
	onDragStart: (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
	},
	onDragEnd: (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
	},
	onDragMove: (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
	},
});
