import Konva from 'konva';
import { DrawerEvent, DrawerEvents } from '../../drawers';
import { StageState } from '../../store/stage';
import { changeCursorStyle } from '../utils';
import { drawerAnimationStateHandlers } from './drawerAnimationStateHandlers';
import { RootState } from '../../store/rootStore';

const AUTO_DRAG_REFRESH_INTERVAL = 300;
const AUTO_DRAG_EDGE_OFFSET = 100;
const AUTO_DRAG_ANIMATION_DURATION = 0.1;
const AUTO_DRAG_MOVE_DISTANCE = 50;

function edgeAutoDrag(stage: Konva.Stage, state: RootState) {
	const pos = stage.getPointerPosition();
	if (!pos) {
		return;
	}

	let newX = stage.x();
	let newY = stage.y();

	const isNearLeft = pos.x < AUTO_DRAG_EDGE_OFFSET;
	if (isNearLeft) {
		newX = stage.x() + AUTO_DRAG_MOVE_DISTANCE;
	}

	const isNearRight = pos.x > stage.width() - AUTO_DRAG_EDGE_OFFSET;
	if (isNearRight) {
		newX = stage.x() - AUTO_DRAG_MOVE_DISTANCE;
	}

	const isNearTop = pos.y < AUTO_DRAG_EDGE_OFFSET;
	if (isNearTop) {
		newY = stage.y() + AUTO_DRAG_MOVE_DISTANCE;
	}

	const isNearBottom = pos.y > stage.height() - AUTO_DRAG_EDGE_OFFSET;
	if (isNearBottom) {
		newY = stage.y() - AUTO_DRAG_MOVE_DISTANCE;
	}

	const isNearEdge = isNearLeft || isNearRight || isNearTop || isNearBottom;
	if (!isNearEdge) {
		return;
	}

	stage.to({
		x: newX,
		y: newY,
		duration: AUTO_DRAG_ANIMATION_DURATION,
		onFinish: () => {
			state.updateCanvasState({
				x: newX,
				y: newY,
			});
		},
	});
}

let autoDragInterval: NodeJS.Timeout | null = null;

function clearAutoDragInterval() {
	if (!autoDragInterval) {
		return;
	}

	clearInterval(autoDragInterval);
	autoDragInterval = null;
}

export function drawerDragStateHandlers(state: RootState): DrawerEvents {
	clearAutoDragInterval();
	return {
		...drawerAnimationStateHandlers,
		onDragEnd: (e: DrawerEvent) => {
			clearAutoDragInterval();
			const { originalEvent } = e;
			if (!originalEvent) {
				return;
			}

			changeCursorStyle('pointer', originalEvent.currentTarget.getStage());
			originalEvent.cancelBubble = true;
			state.changeState(StageState.Select);
			state.clearSnapLines();
		},
		onDragMove: (e: DrawerEvent) => {
			const { id, originalEvent } = e;
			if (!originalEvent) {
				return;
			}

			if (!autoDragInterval) {
				autoDragInterval = setInterval(() => {
					const stage = e.originalEvent?.currentTarget.getStage();
					if (!stage) {
						return;
					}

					edgeAutoDrag(stage, state);
				}, AUTO_DRAG_REFRESH_INTERVAL);
			}

			changeCursorStyle('grabbing', originalEvent.currentTarget.getStage());
			originalEvent.cancelBubble = true;
			const position = originalEvent.currentTarget.getPosition();
			state.moveSelectedElementsByDelta({
				referenceElementId: id,
				x: position.x,
				y: position.y,
			});

			state.createElementSnapLines(id);
			state.changeState(
				e.originalEvent?.evt.shiftKey ? StageState.SnapDragging : StageState.Dragging,
			);
		},
	};
}
