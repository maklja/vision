import { Vector2d } from 'konva/lib/types';
import { snapPositionToGrind } from '../../model';
import { Stage } from 'konva/lib/Stage';

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

