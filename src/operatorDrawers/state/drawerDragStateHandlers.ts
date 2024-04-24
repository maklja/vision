import Konva from 'konva';
import { calcSnapPosition, DrawerDragBoundEvent, DrawerEvent, DrawerEvents } from '../../drawers';
import { StageState } from '../../store/stage';
import { changeCursorStyle } from '../utils';
import { drawerAnimationStateHandlers } from './drawerAnimationStateHandlers';
import { RootState } from '../../store/rootStore';
import { SnapLineOrientation } from '../../model';
import { SNAP_DISTANCE } from '../../store/snapLines';

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

let autoDragInterval: number | null = null;
let shiftKeyDown = false;

function clearAutoDragInterval() {
	if (!autoDragInterval) {
		return;
	}

	clearInterval(autoDragInterval);
	autoDragInterval = null;
}

export function drawerDragStateHandlers(state: RootState): DrawerEvents {
	clearAutoDragInterval();
	shiftKeyDown = false;
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
			originalEvent.cancelBubble = true;

			if (!autoDragInterval) {
				autoDragInterval = window.setInterval(() => {
					const stage = e.originalEvent?.currentTarget.getStage();
					if (!stage) {
						return;
					}

					edgeAutoDrag(stage, state);
				}, AUTO_DRAG_REFRESH_INTERVAL);
			}

			changeCursorStyle('grabbing', originalEvent.currentTarget.getStage());

			const position = originalEvent.currentTarget.getPosition();
			const snapLines = state.createElementSnapLines({
				elementId: id,
				x: position.x,
				y: position.y,
			});

			const verticalSnapLine = snapLines.find(
				(snapLine) => snapLine.orientation === SnapLineOrientation.Vertical,
			);
			const horizontalSnapLine = snapLines.find(
				(snapLine) => snapLine.orientation === SnapLineOrientation.Horizontal,
			);

			const x =
				verticalSnapLine && verticalSnapLine.distance <= SNAP_DISTANCE
					? position.x + verticalSnapLine.distance
					: position.x;
			const y =
				horizontalSnapLine && horizontalSnapLine.distance <= SNAP_DISTANCE
					? position.y + horizontalSnapLine.distance
					: position.y;

			originalEvent.currentTarget.setPosition({ x, y });
			state.moveSelectedElementsByDelta({
				referenceElementId: id,
				x,
				y,
			});

			shiftKeyDown = Boolean(e.originalEvent?.evt.shiftKey);
			state.changeState(StageState.Dragging);
		},
		onDragBound: (e: DrawerDragBoundEvent) => {
			if (!shiftKeyDown) {
				return e.position;
			}

			const gridSize = state.themes.default.grid.size;
			return calcSnapPosition(e.position, gridSize, e.node.getStage());
		},
	};
}

