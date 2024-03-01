import { Point } from '../../model';

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10;
const ZOOM_BY = 2.01;

export function calculateScaleAndPosition(
	origin: Point,
	relativeTo: Point,
	currentScale: number,
	direction: number,
): { scale: Point; position: Point } {
	const unboundedNewScale = direction > 0 ? currentScale * ZOOM_BY : currentScale / ZOOM_BY;
	const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, unboundedNewScale));

	return {
		scale: { x: newScale, y: newScale },
		position: {
			x: origin.x - relativeTo.x * newScale,
			y: origin.y - relativeTo.y * newScale,
		},
	};
}

