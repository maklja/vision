import Konva from 'konva';
import { Point } from '../../model';
import { ZoomType } from '../../store/stage';

export enum ZoomTo {
	Pointer = 'pointer',
	Center = 'center',
}

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10;
const ZOOM_BY = 2.01;

function calculateScaleAndPosition(
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

export function zoomStage(stage: Konva.Stage, zoomType: ZoomType, zoomTo = ZoomTo.Center) {
	const oldScale = stage.scaleX();

	let zoomRelativeTo: Point;
	if (zoomTo === ZoomTo.Pointer) {
		const pointer = stage.getPointerPosition();
		zoomRelativeTo = {
			x: pointer?.x ?? 0,
			y: pointer?.y ?? 0,
		};
	} else {
		zoomRelativeTo = {
			x: stage.width() / 2,
			y: stage.height() / 2,
		};
	}

	const mousePointTo = {
		x: (zoomRelativeTo.x - stage.x()) / oldScale,
		y: (zoomRelativeTo.y - stage.y()) / oldScale,
	};

	const { scale: newScale, position: newPosition } = calculateScaleAndPosition(
		zoomRelativeTo,
		mousePointTo,
		oldScale,
		zoomType,
	);

	stage.scale(newScale);
	stage.position(newPosition);
}

