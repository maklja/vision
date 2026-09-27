import {
	BoundingBox,
	ConnectPointPosition,
	Element,
	IBoundingBox,
	pointOverlapBoundingBox,
	Point,
} from '@maklja/vision-simulator-model';
import {
	calculateShapeSizeBoundingBox,
	createElementSizesContext,
	findElementSize,
} from '../../packages/simulator-viewer/src/theme/sizes';
import { PersistedCanvasState } from './diagram';

/**
 * The viewer derives every operator bounding box from its shared theme rather than a
 * per-operator table, so reuse the same helpers here to keep the tests in sync.
 */
const elementSizes = createElementSizesContext();

export function getElementBounds(element: Element): BoundingBox {
	const shapeSize = findElementSize(elementSizes, element.type);
	return calculateShapeSizeBoundingBox({ x: element.x, y: element.y }, shapeSize);
}

export function getElementCenter(element: Element): Point {
	return getElementBounds(element).center;
}

/**
 * Mirrors the connect-point placement in `createConnectPoints` (connectPointSlice) and
 * returns the center of the connect point circle in world coordinates.
 */
export function getConnectPointCenter(element: Element, position: ConnectPointPosition): Point {
	const shapeSize = findElementSize(elementSizes, element.type);
	const boundingBox = calculateShapeSizeBoundingBox({ x: element.x, y: element.y }, shapeSize);
	const { center } = boundingBox;

	switch (position) {
		case ConnectPointPosition.Top:
			return { x: center.x, y: boundingBox.y - shapeSize.margin };
		case ConnectPointPosition.Right:
			return {
				x: boundingBox.x + boundingBox.width + shapeSize.margin,
				y: center.y,
			};
		case ConnectPointPosition.Bottom:
			return {
				x: center.x,
				y: boundingBox.y + boundingBox.height + shapeSize.margin,
			};
		case ConnectPointPosition.Left:
			return { x: boundingBox.x - shapeSize.margin, y: center.y };
	}
}

/**
 * Converts a world (canvas) point into viewport coordinates using the persisted canvas
 * position/scale and the stage container origin.
 */
export function worldToBrowser(
	point: Point,
	canvasState: PersistedCanvasState,
	stageOrigin: Point,
): Point {
	return {
		x: stageOrigin.x + canvasState.x + point.x * canvasState.scaleX,
		y: stageOrigin.y + canvasState.y + point.y * canvasState.scaleY,
	};
}

const OBSTACLE_MARGIN = 4;

function inflate(boundingBox: IBoundingBox, margin: number): IBoundingBox {
	return {
		x: boundingBox.x - margin,
		y: boundingBox.y - margin,
		width: boundingBox.width + margin * 2,
		height: boundingBox.height + margin * 2,
	};
}

/**
 * Returns a point that lies on a connect-line segment and is clear of the element bounding
 * boxes provided by the caller. Longest clear segment wins, so the click lands on the open
 * wire rather than on an operator the wire crosses.
 */
export function getConnectLineClickPoint(points: Point[], obstacles: IBoundingBox[] = []): Point {
	if (points.length === 0) {
		throw new Error('Cannot compute a click point of an empty polyline');
	}

	if (points.length === 1) {
		return points[0];
	}

	const inflatedObstacles = obstacles.map((boundingBox) => inflate(boundingBox, OBSTACLE_MARGIN));
	const candidates = points.slice(0, -1).map((start, index) => {
		const end = points[index + 1];
		const midpoint = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
		const clear = inflatedObstacles.every(
			(boundingBox) => !pointOverlapBoundingBox(midpoint, boundingBox),
		);
		return { midpoint, clear, length: Math.hypot(end.x - start.x, end.y - start.y) };
	});

	const clearCandidates = candidates.filter((candidate) => candidate.clear);
	const pool = clearCandidates.length > 0 ? clearCandidates : candidates;
	pool.sort((left, right) => right.length - left.length);
	return pool[0].midpoint;
}
