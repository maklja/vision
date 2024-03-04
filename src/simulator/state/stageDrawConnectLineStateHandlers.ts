import Konva from 'konva';
import { AppDispatch } from '../../store/rootState';
import { StageEvents } from '../SimulatorStage';
import {
	addNextPointConnectLineDraw,
	clearSnapLines,
	createConnectPointSnapLines,
	deleteConnectLineDraw,
	moveConnectLineDraw,
} from '../../store/stageSlice';

export const stageDrawConnectLineStateHandlers = (dispatch: AppDispatch): StageEvents => ({
	onMouseMove: (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		const stage = e.target.getStage();
		if (!stage) {
			return;
		}

		const { x, y } = stage.getRelativePointerPosition() ?? { x: 0, y: 0 };
		dispatch(
			moveConnectLineDraw({
				position: {
					x,
					y,
				},
				normalizePosition: e.evt.shiftKey,
			}),
		);
		dispatch(createConnectPointSnapLines());
	},
	onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;

		const stage = e.target.getStage();
		if (!stage) {
			return;
		}

		const { x, y } = stage.getRelativePointerPosition() ?? { x: 0, y: 0 };
		dispatch(
			addNextPointConnectLineDraw({
				x,
				y,
			}),
		);
	},
	onContextMenu: (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		e.evt.preventDefault();

		dispatch(deleteConnectLineDraw());
		dispatch(clearSnapLines());
	},
});

