import Konva from 'konva';
import { StageEvents } from '../SimulatorStage';
import { RootState } from '../../store/rootStore';
import { SnapLineOrientation } from '../../model';

export const stageDrawConnectLineStateHandlers = (state: RootState): StageEvents => ({
	onMouseMove: (e: Konva.KonvaEventObject<MouseEvent>) => {
		e.cancelBubble = true;
		const stage = e.target.getStage();
		if (!stage) {
			return;
		}

		const currentPosition = stage.getRelativePointerPosition();
		if (!currentPosition) {
			return;
		}

		const snapLines = state.createConnectPointSnapLines(currentPosition);
		const verticalSnapLine = snapLines.find(
			(snapLine) => snapLine.orientation === SnapLineOrientation.Vertical,
		);
		const horizontalSnapLine = snapLines.find(
			(snapLine) => snapLine.orientation === SnapLineOrientation.Horizontal,
		);

		const x = verticalSnapLine
			? currentPosition.x - verticalSnapLine.distance
			: currentPosition.x;
		const y = horizontalSnapLine
			? currentPosition.y - horizontalSnapLine.distance
			: currentPosition.y;

		state.moveConnectLineDraw({
			position: {
				x,
				y,
			},
			normalizePosition: e.evt.shiftKey,
		});
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

