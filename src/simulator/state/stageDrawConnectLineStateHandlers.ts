import Konva from 'konva';
import { AppDispatch } from '../../store/rootState';
import { StageEvents } from '../SimulatorStage';
import { deleteConnectLineDraw, moveConnectLineDraw } from '../../store/stageSlice';

export const stageDrawConnectLineStateHandlers = (dispatch: AppDispatch): StageEvents => ({
	onMouseMove: (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;

		const stage = e.target.getStage();
		const rect = stage?.getContent().getBoundingClientRect();
		const x = e.evt.clientX - (rect?.left ?? 0);
		const y = e.evt.clientY - (rect?.top ?? 0);
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