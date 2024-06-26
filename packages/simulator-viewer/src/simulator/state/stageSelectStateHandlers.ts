import Konva from 'konva';
import { StageEvents } from '../SimulatorStage';
import { changeCursorStyle } from '../../operatorDrawers/utils';
import { ZoomTo, zoomStage } from './calculateScaleAndPosition';
import { RootState } from '../../store/rootStore';
import { StageState, ZoomType } from '../../store/stage';
import { themeColors } from '../../theme';

const LEFT_MOUSE_BUTTON = 0;
const PAN_MOUSE_BUTTON_KEY = 1;
const CANCEL_MOUSE_BUTTON_KEY = 2;

export const stageSelectStateHandlers = (state: RootState): StageEvents => ({
	onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => {
		const stage = e.currentTarget.getStage();
		if (!stage) {
			return;
		}

		const { button, buttons, ctrlKey } = e.evt;
		if ((button !== LEFT_MOUSE_BUTTON && buttons !== LEFT_MOUSE_BUTTON) || !ctrlKey) {
			return;
		}

		const mousePosition = stage.getRelativePointerPosition();
		if (!mousePosition) {
			return;
		}

		state.startLassoSelection(mousePosition);
	},
	onMouseMove: (e: Konva.KonvaEventObject<MouseEvent>) => {
		const stage = e.currentTarget.getStage();
		if (!stage) {
			return;
		}

		const { button, buttons } = e.evt;
		if (button !== LEFT_MOUSE_BUTTON && buttons !== LEFT_MOUSE_BUTTON) {
			return;
		}

		const mousePosition = stage.getRelativePointerPosition();
		if (!mousePosition) {
			return;
		}

		if (e.evt.ctrlKey) {
			state.updateLassoSelection(mousePosition);
		} else if (state.state === StageState.LassoSelect) {
			state.stopLassoSelection();
		}
	},
	onMouseUp: () => {
		state.selectElementsInLassoBoundingBox();
		state.stopLassoSelection();
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

		state.updateCanvasState({
			x: stage.position().x,
			y: stage.position().y,
			width: stage.width(),
			height: stage.height(),
			scaleX: stage.scaleX(),
			scaleY: stage.scaleY(),
		});
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
		state.updateCanvasState({
			x: stage.position().x,
			y: stage.position().y,
			width: stage.width(),
			height: stage.height(),
			scaleX: stage.scaleX(),
			scaleY: stage.scaleY(),
		});
	},
	onKeyUp: (e: KeyboardEvent, stage: Konva.Stage | null) => {
		if (e.key.toLowerCase() === 'delete') {
			state.removeSelectedElements();
			changeCursorStyle('default', stage);
		} else if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 't') {
			const currentThemeColor = state.theme.default.colors;

			const currentThemeIndex = themeColors.findIndex(
				(themeColor) => themeColor.id === currentThemeColor.id,
			);
			const nextThemeColor = themeColors[currentThemeIndex + 1] ?? themeColors[0];
			state.changeTheme(nextThemeColor.id);
		} else if (e.ctrlKey && e.key.toLowerCase() === 'c') {
			state.copySelected();
		} else if (e.ctrlKey && e.key.toLowerCase() === 'v') {
			state.pasteSelected(stage?.getRelativePointerPosition() ?? { x: 0, y: 0 });
		}
	},
	onContextMenu: (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		e.evt.preventDefault();

		const { button, buttons } = e.evt;
		if (button !== CANCEL_MOUSE_BUTTON_KEY && buttons !== CANCEL_MOUSE_BUTTON_KEY) {
			return;
		}

		state.clearAllSelectedElements();
	},
});

