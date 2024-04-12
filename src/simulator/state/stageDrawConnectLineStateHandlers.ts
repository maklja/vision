import Konva from 'konva';
import { StageEvents } from '../SimulatorStage';
import { RootState } from '../../store/rootStateNew';

export const stageDrawConnectLineStateHandlers = (state: RootState): StageEvents => ({
	onMouseMove: (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		const stage = e.target.getStage();
		if (!stage) {
			return;
		}

		const { x, y } = stage.getRelativePointerPosition() ?? { x: 0, y: 0 };
		state.moveConnectLineDraw({
			position: {
				x,
				y,
			},
			normalizePosition: e.evt.shiftKey,
		});
		state.createConnectPointSnapLines();
	},
	onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;

		const stage = e.target.getStage();
		if (!stage) {
			return;
		}

		const point = stage.getRelativePointerPosition() ?? { x: 0, y: 0 };
		state.addNextPointToConnectLineDraw(point);
	},
	onContextMenu: (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		e.evt.preventDefault();

		state.stopConnectPointDraw();
		state.clearSnapLines();
	},
});

