import Konva from 'konva';
import { AppDispatch } from '../../store/rootState';
import { StageEvents } from '../SimulatorStage';
import { selectElements } from '../../store/stageSlice';

export const stageSelectStateHandlers = (dispatch: AppDispatch): StageEvents => ({
	onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;

		dispatch(selectElements([]));
	},
});
