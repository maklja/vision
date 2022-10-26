import Konva from 'konva';
import {
	StageState,
	highlightDrawers,
	removeHighlightDrawers,
	selectDrawers,
	moveDrawer,
	changeState,
} from '../stageSlice';
import { AppDispatch } from '../rootState';

const changeCursorStyle = (cursorStyle: string, e: Konva.KonvaEventObject<MouseEvent>) => {
	const stage = e.currentTarget.getStage();
	if (!stage) {
		return;
	}

	stage.container().style.cursor = cursorStyle;
};

const selectStateDispatch = (dispatch: AppDispatch) => ({
	onMouseDown: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		dispatch(selectDrawers([id]));
	},
	onMouseOver: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		changeCursorStyle('pointer', e);
		dispatch(highlightDrawers([id]));
	},
	onMouseOut: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		changeCursorStyle('default', e);
		dispatch(removeHighlightDrawers([id]));
	},
	onDragStart: (_: string, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		dispatch(changeState(StageState.Dragging));
	},
	onDragEnd: (_: string, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		dispatch(changeState(StageState.Select));
	},
	onDragMove: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		const position = e.currentTarget.getAbsolutePosition();
		dispatch(
			moveDrawer({
				id,
				x: position.x,
				y: position.y,
			}),
		);
	},
});

const dragStateDispatch = (dispatch: AppDispatch) => ({
	onDragEnd: (_: string, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		dispatch(changeState(StageState.Select));
	},
	onDragMove: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		const position = e.currentTarget.getAbsolutePosition();
		dispatch(
			moveDrawer({
				id,
				x: position.x,
				y: position.y,
			}),
		);
	},
});

export const elementConnector = (state: StageState) => {
	if (state === StageState.Select) {
		return selectStateDispatch;
	}

	if (state === StageState.Dragging) {
		return dragStateDispatch;
	}

	return () => ({});
};

