import Konva from 'konva';
import { AppDispatch } from '../../store/rootState';
import { StageEvents } from '../SimulatorStage';
import { selectElements } from '../../store/stageSlice';
import { changeCursorStyle } from '../../operatorDrawers/utils';

const PAN_MOUSE_BUTTON_KEY = 1;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10;
const ZOOM_BY = 2.01;

export const stageSelectStateHandlers = (dispatch: AppDispatch): StageEvents => ({
	onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;

		dispatch(selectElements([]));
	},
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

		changeCursorStyle('grabbing', e);
	},
	onDragEnd: (e: Konva.KonvaEventObject<MouseEvent>) => {
		changeCursorStyle('default', e);
	},
	onWheel: (e: Konva.KonvaEventObject<WheelEvent>) => {
		e.evt.preventDefault();

		const stage = e.currentTarget.getStage();
		if (!stage) {
			return;
		}

		const oldScale = stage.scaleX();
		const pointer = stage.getPointerPosition();

		const pointerX = pointer?.x ?? 0;
		const pointerY = pointer?.y ?? 0;

		const mousePointTo = {
			x: (pointerX - stage.x()) / oldScale,
			y: (pointerY - stage.y()) / oldScale,
		};

		let direction = e.evt.deltaY > 0 ? 1 : -1;
		if (e.evt.ctrlKey) {
			direction = -direction;
		}

		const unboundedNewScale = direction > 0 ? oldScale * ZOOM_BY : oldScale / ZOOM_BY;
		const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, unboundedNewScale));

		stage.scale({ x: newScale, y: newScale });
		stage.position({
			x: pointerX - mousePointTo.x * newScale,
			y: pointerY - mousePointTo.y * newScale,
		});
	},
});
