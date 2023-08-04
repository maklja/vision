import Konva from 'konva';
import { AppDispatch } from '../../store/rootState';
import { StageEvents } from '../SimulatorStage';
import { deleteConnectLineDraw, moveConnectLineDraw } from '../../store/stageSlice';

export const stageDrawConnectLineStateHandlers = (dispatch: AppDispatch): StageEvents => ({
	onMouseMove: (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;

		const stage = e.target.getStage();
		if (!stage) {
			return;
		}

		const pointerPosition = stage.getRelativePointerPosition();
		const x = pointerPosition.x;
		const y = pointerPosition.y;
		dispatch(
			moveConnectLineDraw({
				x,
				y,
			}),
		);
	},
	onMouseUp: (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;

		dispatch(deleteConnectLineDraw());
	},
});

