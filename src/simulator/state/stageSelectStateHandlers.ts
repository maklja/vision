import Konva from 'konva';
import { AppDispatch } from '../../store/rootState';
import { StageEvents } from '../SimulatorStage';
import { removeSelected, clearSelected, updateCanvasState } from '../../store/stageSlice';
import { changeCursorStyle } from '../../operatorDrawers/utils';
import { ZoomTo, zoomStage } from './calculateScaleAndPosition';
import { ZoomType } from '../../store/canvas';

const PAN_MOUSE_BUTTON_KEY = 1;
const CANCEL_MOUSE_BUTTON_KEY = 2;

export const stageSelectStateHandlers = (dispatch: AppDispatch): StageEvents => ({
	onDragStart: (e: Konva.KonvaEventObject<MouseEvent>) => {
		const stage = e.currentTarget.getStage();
		if (!stage) {
			return;
		}

		const { button, buttons } = e.evt;
		if (button !== PAN_MOUSE_BUTTON_KEY && buttons !== PAN_MOUSE_BUTTON_KEY) {
			stage.stopDrag();
			return;
		}

		changeCursorStyle('grabbing', e.currentTarget.getStage());
	},
	onDragEnd: (e: Konva.KonvaEventObject<MouseEvent>) => {
		changeCursorStyle('default', e.currentTarget.getStage());
	},
	onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => {
		const stage = e.currentTarget.getStage();
		if (!stage) {
			return;
		}

		dispatch(
			updateCanvasState({
				x: stage.position().x,
				y: stage.position().y,
				width: stage.width(),
				height: stage.height(),
				scaleX: stage.scaleX(),
				scaleY: stage.scaleY(),
			}),
		);
	},
	onWheel: (e: Konva.KonvaEventObject<WheelEvent>) => {
		e.evt.preventDefault();

		const stage = e.currentTarget.getStage();
		if (!stage) {
			return;
		}

		let zoomType = e.evt.deltaY > 0 ? ZoomType.In : ZoomType.Out;
		if (e.evt.ctrlKey) {
			zoomType = -zoomType;
		}

		zoomStage(stage, zoomType, ZoomTo.Pointer);
		dispatch(
			updateCanvasState({
				x: stage.position().x,
				y: stage.position().y,
				width: stage.width(),
				height: stage.height(),
				scaleX: stage.scaleX(),
				scaleY: stage.scaleY(),
			}),
		);
	},
	onKeyUp: (e: KeyboardEvent, stage: Konva.Stage | null) => {
		if (e.key === 'Delete') {
			dispatch(removeSelected());
			changeCursorStyle('default', stage);
		}
	},
	onContextMenu: (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		e.evt.preventDefault();

		const { button, buttons } = e.evt;
		if (button !== CANCEL_MOUSE_BUTTON_KEY && buttons !== CANCEL_MOUSE_BUTTON_KEY) {
			return;
		}

		dispatch(clearSelected());
	},
});

