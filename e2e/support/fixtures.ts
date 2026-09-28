import {
	ConnectLine,
	ConnectPointPosition,
	ConnectPointType,
	Element,
	ElementProps,
	ElementType,
} from '@maklja/vision-simulator-model';
import { PersistedCanvasState, PersistedDiagram } from './diagram';

/**
 * Persisted-diagram fixtures for the recovery and cancellation journeys. They are seeded straight
 * into IndexedDB so the tests can focus on runtime behavior instead of repeating graph construction
 * through palette drops and canvas gestures.
 */

const CANVAS_STATE: PersistedCanvasState = { x: 0, y: 0, scaleX: 1, scaleY: 1 };
const THEME_ID = 'sea';

interface ElementSeed {
	id: string;
	type: ElementType;
	name: string;
	x: number;
	y: number;
	properties?: ElementProps;
}

interface ConnectLineSeed {
	id: string;
	sourceId: string;
	targetId: string;
	sourceType?: ConnectPointType;
	targetType?: ConnectPointType;
	sourcePosition?: ConnectPointPosition;
	targetPosition?: ConnectPointPosition;
	index?: number;
}

function createElement(seed: ElementSeed): Element {
	return {
		id: seed.id,
		type: seed.type,
		name: seed.name,
		x: seed.x,
		y: seed.y,
		visible: true,
		properties: seed.properties ?? {},
	};
}

/** Two-point wire that starts to the right of its source and ends left of its target. */
function createConnectLine(seed: ConnectLineSeed, elements: Element[]): ConnectLine {
	const source = elements.find((element) => element.id === seed.sourceId);
	const target = elements.find((element) => element.id === seed.targetId);
	if (!source || !target) {
		throw new Error(`Cannot wire "${seed.id}": a fixture endpoint is missing`);
	}

	const sourcePosition = seed.sourcePosition ?? ConnectPointPosition.Right;
	const targetPosition = seed.targetPosition ?? ConnectPointPosition.Left;
	const sourceOffset =
		sourcePosition === ConnectPointPosition.Top ? { x: 30, y: 0 } : { x: 60, y: 30 };
	const targetOffset =
		targetPosition === ConnectPointPosition.Top ? { x: 30, y: 0 } : { x: 0, y: 30 };

	return {
		id: seed.id,
		source: {
			id: source.id,
			connectPointType: seed.sourceType ?? ConnectPointType.Output,
			connectPosition: sourcePosition,
		},
		target: {
			id: target.id,
			connectPointType: seed.targetType ?? ConnectPointType.Input,
			connectPosition: targetPosition,
		},
		points: [
			{ x: source.x + sourceOffset.x, y: source.y + sourceOffset.y },
			{ x: target.x + targetOffset.x, y: target.y + targetOffset.y },
		],
		locked: true,
		index: seed.index ?? 0,
		name: '',
	};
}

function createDiagram(
	seeds: ElementSeed[],
	connectLineSeeds: ConnectLineSeed[],
): PersistedDiagram {
	const elements = seeds.map(createElement);
	return {
		elements,
		connectLines: connectLineSeeds.map((seed) => createConnectLine(seed, elements)),
		canvasState: CANVAS_STATE,
		themeId: THEME_ID,
	};
}

const ofArgs = (values: number[]) =>
	`function argsFactory() {\n\treturn [${values.join(', ')}];\n}`;

/**
 * Creation-error recovery: a `of -> buffer -> subscriber` pipeline whose buffer element has no
 * event reference, plus a separate deterministic `of -> subscriber` pipeline.
 */
export const creationErrorFixture: PersistedDiagram = createDiagram(
	[
		{
			id: 'bad-of',
			type: ElementType.Of,
			name: 'bad_source',
			x: 140,
			y: 100,
			properties: { argsFactoryExpression: ofArgs([1, 2, 3]) },
		},
		{ id: 'buffer', type: ElementType.Buffer, name: 'buffer_0', x: 360, y: 100 },
		{ id: 'bad-subscriber', type: ElementType.Subscriber, name: 'bad_sink', x: 580, y: 100 },
		{
			id: 'good-of',
			type: ElementType.Of,
			name: 'good_source',
			x: 140,
			y: 320,
			properties: { argsFactoryExpression: ofArgs([1, 2, 3, 4]) },
		},
		{ id: 'good-subscriber', type: ElementType.Subscriber, name: 'good_sink', x: 360, y: 320 },
	],
	[
		{ id: 'bad-of-buffer', sourceId: 'bad-of', targetId: 'buffer' },
		{ id: 'buffer-bad-subscriber', sourceId: 'buffer', targetId: 'bad-subscriber' },
		{ id: 'good-of-subscriber', sourceId: 'good-of', targetId: 'good-subscriber' },
	],
);

/**
 * Runtime-error recovery: `throwError -> subscriber` next to a deterministic `of -> subscriber`
 * pipeline.
 */
export const runtimeErrorFixture: PersistedDiagram = createDiagram(
	[
		{
			id: 'throw-error',
			type: ElementType.ThrowError,
			name: 'error_source',
			x: 140,
			y: 100,
			properties: {
				errorOrErrorFactory: `function errorFactory() {\n\treturn new Error('Unexpected error!');\n}`,
			},
		},
		{
			id: 'error-subscriber',
			type: ElementType.Subscriber,
			name: 'error_sink',
			x: 360,
			y: 100,
		},
		{
			id: 'good-of',
			type: ElementType.Of,
			name: 'good_source',
			x: 140,
			y: 320,
			properties: { argsFactoryExpression: ofArgs([1, 2, 3, 4]) },
		},
		{ id: 'good-subscriber', type: ElementType.Subscriber, name: 'good_sink', x: 360, y: 320 },
	],
	[
		{ id: 'throw-error-subscriber', sourceId: 'throw-error', targetId: 'error-subscriber' },
		{ id: 'good-of-subscriber', sourceId: 'good-of', targetId: 'good-subscriber' },
	],
);

/** Infinite-source cancellation: `interval(period: 25) -> subscriber`. */
export const infiniteSourceFixture: PersistedDiagram = createDiagram(
	[
		{
			id: 'interval',
			type: ElementType.Interval,
			name: 'interval_0',
			x: 140,
			y: 100,
			properties: { period: 25 },
		},
		{ id: 'interval-subscriber', type: ElementType.Subscriber, name: 'sink_0', x: 360, y: 100 },
	],
	[{ id: 'interval-to-subscriber', sourceId: 'interval', targetId: 'interval-subscriber' }],
);

/** Elements are exported by id so journeys never repeat fixture literals. */
export function fixtureElement(diagram: PersistedDiagram, id: string): Element {
	const element = diagram.elements.find((candidate) => candidate.id === id);
	if (!element) {
		throw new Error(`No fixture element with id "${id}"`);
	}

	return element;
}
