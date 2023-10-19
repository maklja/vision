import { Point } from '../common';

export const snapPositionToGrind = (position: Point, gridSize: number) => {
	const newX1 = position.x + (gridSize - (position.x % gridSize));
	const newX2 = position.x - (position.x % gridSize);

	const newY1 = position.y + (gridSize - (position.y % gridSize));
	const newY2 = position.y - (position.y % gridSize);

	return {
		x: Math.abs(newX1 - position.x) < Math.abs(newX2 - position.x) ? newX1 : newX2,
		y: Math.abs(newY1 - position.y) < Math.abs(newY2 - position.y) ? newY1 : newY2,
	};
};
