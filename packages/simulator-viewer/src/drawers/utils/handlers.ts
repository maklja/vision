import { Vector2d } from 'konva/lib/types';
import { Node } from 'konva/lib/Node';
import { Stage } from 'konva/lib/Stage';
import { Point, snapPositionToGrind } from '@maklja/vision-simulator-model';
import { DrawerDragBoundEvent } from '../DrawerProps';

export function calcSnapPosition(pos: Vector2d, gridSize: number, stage: Stage | null) {
	const stageScale = stage?.scale() ?? { x: 1, y: 1 };
	const stagePosition = stage?.position() ?? { x: 0, y: 0 };
	const scaledGridSize = gridSize * stageScale.x;
	const nodeGridPosition = snapPositionToGrind(pos, scaledGridSize);

	return {
		x: nodeGridPosition.x + (stagePosition.x % scaledGridSize),
		y: nodeGridPosition.y + (stagePosition.y % scaledGridSize),
	};
}

export const handleDragBoundFunc = (
	id: string,
	onDragBound?: (event: DrawerDragBoundEvent) => Point,
) =>
	function (this: Node, position: Vector2d) {
		if (!onDragBound) {
			return position;
		}

		return onDragBound({
			id,
			node: this,
			position,
		});
	};
