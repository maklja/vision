import {
	isParameterValue,
	parameterTypeForField,
	validateParameterValue,
	validateParameterConstraint,
	wrapParameterProperties,
} from '../parameters/ParameterValue';
import { Element, ElementType, resultOperators } from '../element';
import { ConnectLine } from '../connectLine';
import { ConnectPointPosition, ConnectPointType } from '../connectPoint';
import { findElementDescriptor } from '../descriptors';
import { mapToOperatorPropsTemplate } from '../templates';

export interface DiagramData {
	/** Optional finite JSON initialization data; runtime mutations are never persisted. */
	contextSeed?: Record<string, unknown>;
	elements: Element[];
	connectLines: ConnectLine[];
	canvasState: { x: number; y: number; scaleX: number; scaleY: number };
	themeId: string;
}

export interface DiagramDocument {
	schemaVersion: 2;
	id: string;
	name: string;
	createdAt: string;
	updatedAt: string;
	/** Provenance, never an execution permission. File imports always force 'file'. */
	origin: 'local' | 'file';
	diagram: DiagramData;
}

export const DIAGRAM_SCHEMA_VERSION = 2;
export const MAX_DIAGRAM_BYTES = 5 * 1024 * 1024;
export const MAX_DIAGRAM_DEPTH = 64;
export const MAX_DIAGRAM_ELEMENTS = 10_000;
export const MAX_DIAGRAM_LINES = 20_000;
const unsafeKeys = new Set(['__proto__', 'constructor', 'prototype']);

export class DiagramValidationError extends Error {
	constructor(
		public readonly path: string,
		reason: string,
	) {
		super(`${path}: ${reason}`);
		this.name = 'DiagramValidationError';
	}
}

function check(condition: unknown, path: string, reason: string): asserts condition {
	if (!condition) throw new DiagramValidationError(path, reason);
}

function record(value: unknown, path: string): Record<string, unknown> {
	check(
		value !== null && typeof value === 'object' && !Array.isArray(value),
		path,
		'expected an object',
	);
	check(
		Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null,
		path,
		'non-JSON object',
	);
	check(
		Object.values(Object.getOwnPropertyDescriptors(value)).every((d) => !d.get && !d.set),
		path,
		'accessors are not JSON',
	);
	return value as Record<string, unknown>;
}

function keys(value: Record<string, unknown>, allowed: string[], path: string) {
	for (const key of Object.keys(value))
		check(allowed.includes(key), `${path}.${key}`, 'unsupported field');
}

function text(value: unknown, path: string, nonempty = false): asserts value is string {
	check(
		typeof value === 'string' && (!nonempty || value.length > 0) && value.length <= 65_536,
		path,
		'expected bounded text',
	);
}

function number(value: unknown, path: string): asserts value is number {
	check(typeof value === 'number' && Number.isFinite(value), path, 'expected a finite number');
}

/** Inspect before JSON.stringify so cycles, non-JSON values and deep objects cannot bypass limits. */
export function validateJsonData(value: unknown): void {
	const active = new Set<object>();
	let bytes = 0;
	function visit(item: unknown, depth: number, path: string) {
		check(depth <= MAX_DIAGRAM_DEPTH, path, 'maximum JSON depth exceeded');
		if (item === null || typeof item === 'boolean') bytes += 5;
		else if (typeof item === 'number') {
			number(item, path);
			bytes += String(item).length;
		} else if (typeof item === 'string')
			bytes += new TextEncoder().encode(JSON.stringify(item)).length;
		else {
			check(typeof item === 'object' && item !== null, path, 'expected JSON data');
			check(!active.has(item), path, 'cyclic data');
			check(
				Array.isArray(item) ||
					Object.getPrototypeOf(item) === Object.prototype ||
					Object.getPrototypeOf(item) === null,
				path,
				'non-JSON object',
			);
			active.add(item);
			bytes += 2;
			check(
				Object.getOwnPropertySymbols(item).length === 0,
				path,
				'symbol keys are not JSON',
			);
			const descriptors = Object.getOwnPropertyDescriptors(item);
			for (const descriptor of Object.values(descriptors))
				check(!descriptor.get && !descriptor.set, path, 'accessors are not JSON');
			for (const [key, child] of Object.entries(item)) {
				check(!unsafeKeys.has(key), path, 'unsafe object key');
				bytes += new TextEncoder().encode(JSON.stringify(key)).length + 2;
				visit(child, depth + 1, `${path}.${key}`);
			}
			active.delete(item);
		}
		check(bytes <= MAX_DIAGRAM_BYTES, path, 'maximum diagram size exceeded');
	}
	visit(value, 0, 'diagram');
}

const optionalProperties: Partial<Record<ElementType, Record<string, string>>> = {
	[ElementType.Range]: { count: 'number' },
	[ElementType.Generate]: { condition: 'string' },
	[ElementType.Ajax]: {
		body: 'string',
		headers: 'pairs',
		queryParams: 'pairs',
		timeout: 'number',
		responseType: 'string',
	},
	[ElementType.BufferTime]: { bufferCreationInterval: 'number', maxBufferSize: 'number' },
	[ElementType.MergeMap]: { concurrent: 'number' },
	[ElementType.Expand]: { concurrent: 'number' },
};

function validateProperties(
	type: ElementType,
	value: unknown,
	path: string,
	mode: 'runtime' | 'legacy' | 'typed',
) {
	const props = record(value, path);
	const template = mapToOperatorPropsTemplate(type);
	const optional = optionalProperties[type] ?? {};
	keys(props, [...Object.keys(template), ...Object.keys(optional)], path);
	for (const [key, sample] of Object.entries(template)) {
		if (Object.hasOwn(optional, key) && !Object.hasOwn(props, key)) continue;
		const parameterType = parameterTypeForField(type, key, props);
		if (parameterType) {
			try {
				const value = props[key];
				if (mode === 'legacy' || (mode === 'runtime' && typeof value === 'number')) {
					validateParameterConstraint(type, key, value, props);
				} else {
					validateParameterValue(value, parameterType);
					if (value.kind === 'literal')
						validateParameterConstraint(type, key, value.value, props);
				}
			} catch (error) {
				throw new DiagramValidationError(`${path}.${key}`, String(error));
			}
			continue;
		}
		check(typeof props[key] === typeof sample, `${path}.${key}`, `expected ${typeof sample}`);
	}
	for (const [key, value] of Object.entries(props)) {
		if (typeof value === 'number') number(value, `${path}.${key}`);
		if (typeof value === 'string') text(value, `${path}.${key}`);
		const expected = optional[key];
		if (expected === 'pairs')
			check(
				Array.isArray(value) &&
					value.every(
						(pair) =>
							Array.isArray(pair) &&
							pair.length === 2 &&
							pair.every((v) => typeof v === 'string'),
					),
				`${path}.${key}`,
				'expected string pairs',
			);
		else if (
			expected &&
			!(
				mode !== 'legacy' &&
				parameterTypeForField(type, key, props) &&
				isParameterValue(value)
			)
		)
			check(typeof value === expected, `${path}.${key}`, `expected ${expected}`);
	}
	if (Object.hasOwn(props, 'observableInputsType'))
		check(
			['array', 'object'].includes(String(props.observableInputsType)),
			path,
			'invalid join input mode',
		);
	if (type === ElementType.Timer) {
		check(props.dueDateType === 0 || props.dueDateType === 1, path, 'invalid timer due mode');
		if (props.dueDateType === 1 && !isParameterValue(props.startDue))
			check(
				Number.isInteger(props.startDue) && Math.abs(props.startDue as number) <= 8.64e15,
				path,
				'invalid timer date',
			);
	}
}

/** Validate editable source data, not run readiness: disconnected/incomplete graphs are valid drafts. */
export function validateDiagramData(
	value: unknown,
	mode: 'runtime' | 'legacy' | 'typed' = 'runtime',
): DiagramData {
	validateJsonData(value);
	const data = record(value, 'diagram');
	keys(data, ['elements', 'connectLines', 'canvasState', 'themeId', 'contextSeed'], 'diagram');
	check(
		Array.isArray(data.elements) && data.elements.length <= MAX_DIAGRAM_ELEMENTS,
		'elements',
		'expected at most 10000 elements',
	);
	check(
		Array.isArray(data.connectLines) && data.connectLines.length <= MAX_DIAGRAM_LINES,
		'connectLines',
		'expected at most 20000 lines',
	);
	if (data.contextSeed !== undefined) validateContextSeed(data.contextSeed);
	const elements = new Map<string, Element>();
	const ids = new Set<string>();
	for (const [i, item] of data.elements.entries()) {
		const path = `elements[${i}]`;
		const el = record(item, path);
		keys(el, ['id', 'type', 'name', 'x', 'y', 'visible', 'properties'], path);
		text(el.id, `${path}.id`, true);
		check(!unsafeKeys.has(el.id) && !ids.has(el.id), path, 'duplicate or unsafe ID');
		ids.add(el.id);
		check(
			Object.values(ElementType).includes(el.type as ElementType) &&
				el.type !== ElementType.Result &&
				el.type !== ElementType.ConnectPoint,
			path,
			'unsupported source operator',
		);
		text(el.name, `${path}.name`);
		number(el.x, `${path}.x`);
		number(el.y, `${path}.y`);
		check(typeof el.visible === 'boolean', path, 'missing visibility');
		validateProperties(el.type as ElementType, el.properties, `${path}.properties`, mode);
		elements.set(el.id, el as unknown as Element);
	}
	const portCounts = new Map<string, number>();
	for (const [i, item] of data.connectLines.entries()) {
		const path = `connectLines[${i}]`;
		const line = record(item, path);
		keys(line, ['id', 'source', 'target', 'points', 'locked', 'index', 'name'], path);
		text(line.id, `${path}.id`, true);
		check(!unsafeKeys.has(line.id) && !ids.has(line.id), path, 'duplicate or unsafe ID');
		ids.add(line.id);
		text(line.name, `${path}.name`);
		number(line.index, `${path}.index`);
		check(
			Number.isInteger(line.index) && line.index >= 0 && typeof line.locked === 'boolean',
			path,
			'invalid line index/lock',
		);
		check(
			Array.isArray(line.points) && line.points.length >= 2 && line.points.length <= 1024,
			path,
			'expected 2–1024 points',
		);
		for (const point of line.points) {
			const p = record(point, path);
			keys(p, ['x', 'y'], path);
			number(p.x, path);
			number(p.y, path);
		}
		const endpoints = [record(line.source, path), record(line.target, path)];
		check(endpoints[0].id !== endpoints[1].id, path, 'self connection');
		for (const [j, endpoint] of endpoints.entries()) {
			keys(endpoint, ['id', 'connectPointType', 'connectPosition'], path);
			text(endpoint.id, path, true);
			const el = elements.get(endpoint.id);
			const other = elements.get(String(endpoints[1 - j].id));
			check(el && other, path, 'connection references missing element');
			const kind = endpoint.connectPointType as ConnectPointType;
			check(Object.values(ConnectPointType).includes(kind), path, 'unknown port');
			const position = endpoint.connectPosition;
			check(
				kind === ConnectPointType.Input
					? position === ConnectPointPosition.Left
					: kind === ConnectPointType.Output
						? position === ConnectPointPosition.Right
						: position === ConnectPointPosition.Top ||
							position === ConnectPointPosition.Bottom,
				path,
				'invalid port position',
			);
			const descriptor = findElementDescriptor(el.type, el.properties)[kind];
			check(
				descriptor && descriptor.allowedTypes.has(other.type),
				path,
				'incompatible port/operator',
			);
			const key = `${el.id}:${kind}`;
			const count = (portCounts.get(key) ?? 0) + 1;
			portCounts.set(key, count);
			check(count <= descriptor.cardinality, path, 'port cardinality exceeded');
		}
		const [sourceKind, targetKind] = endpoints.map((p) => p.connectPointType);
		check(
			targetKind === ConnectPointType.Input &&
				(sourceKind === ConnectPointType.Output || sourceKind === ConnectPointType.Event),
			path,
			'expected Output/Event source and Input target',
		);
	}
	const canvas = record(data.canvasState, 'canvasState');
	keys(canvas, ['x', 'y', 'scaleX', 'scaleY'], 'canvasState');
	for (const key of ['x', 'y', 'scaleX', 'scaleY']) number(canvas[key], `canvasState.${key}`);
	check(
		(canvas.scaleX as number) > 0 && (canvas.scaleY as number) > 0,
		'canvasState',
		'scale must be positive',
	);
	text(data.themeId, 'themeId', true);
	return JSON.parse(JSON.stringify(data)) as DiagramData;
}

function validateDocument(value: unknown, version: 1 | 2): DiagramDocument {
	validateJsonData(value);
	const doc = record(value, 'document');
	check(
		doc.schemaVersion === version,
		'schemaVersion',
		'unsupported version; original data was not changed',
	);
	keys(
		doc,
		['schemaVersion', 'id', 'name', 'createdAt', 'updatedAt', 'origin', 'diagram'],
		'document',
	);
	text(doc.id, 'id', true);
	check(!unsafeKeys.has(doc.id), 'id', 'unsafe ID');
	text(doc.name, 'name', true);
	for (const key of ['createdAt', 'updatedAt']) {
		text(doc[key], key);
		check(Number.isFinite(Date.parse(doc[key])), key, 'invalid timestamp');
	}
	check(doc.origin === 'local' || doc.origin === 'file', 'origin', 'invalid provenance');
	return {
		...doc,
		diagram: validateDiagramData(doc.diagram, version === 1 ? 'legacy' : 'typed'),
	} as DiagramDocument;
}

export function validateDiagramDocument(value: unknown): DiagramDocument {
	return validateDocument(value, DIAGRAM_SCHEMA_VERSION);
}

export function diagramWithTypedParameters(data: unknown): DiagramData {
	const checked = validateDiagramData(data);
	return validateDiagramData(
		{
			...checked,
			elements: checked.elements.map((el) => ({
				...el,
				properties: wrapParameterProperties(el.type, el.properties),
			})),
		},
		'typed',
	);
}

/** Recognize only released v1 and current v2. Callers durably back up v1 before writing v2. */
export function upgradeDiagramDocument(value: unknown): DiagramDocument {
	const raw = record(value, 'document');
	if (raw.schemaVersion !== 1) return validateDiagramDocument(value);
	const checked = validateDocument(value, 1);
	return validateDiagramDocument({
		...checked,
		schemaVersion: 2,
		diagram: diagramWithTypedParameters(checked.diagram),
	});
}

export function parseDiagramFile(source: string): DiagramDocument {
	check(
		new TextEncoder().encode(source).length <= MAX_DIAGRAM_BYTES,
		'file',
		'maximum diagram size exceeded',
	);
	let value: unknown;
	try {
		value = JSON.parse(source);
	} catch {
		throw new DiagramValidationError('file', 'invalid JSON');
	}
	return upgradeDiagramDocument(value);
}

/** Only v0 (the released unversioned shape) is supported. No prototype property guessing. */
export function migrateLegacyDiagram(value: unknown, id: string, now: string): DiagramDocument {
	const raw = record(value, 'legacy');
	const elements = Array.isArray(raw.elements)
		? raw.elements
				.filter(
					(item) =>
						!resultOperators.has(record(item, 'legacy.element').type as ElementType),
				)
				.map((item) => {
					const el = record(item, 'legacy.element');
					if (
						el.properties === null ||
						typeof el.properties !== 'object' ||
						Array.isArray(el.properties)
					)
						return el;
					// IndexedDB v0 can retain explicitly undefined optional fields. Preserve absence,
					// not a template fallback (notably range.count). Never remove a corrupt required field.
					const optional = optionalProperties[el.type as ElementType] ?? {};
					const properties = Object.fromEntries(
						Object.entries(record(el.properties, 'legacy.element.properties')).filter(
							([key, value]) =>
								!(value === undefined && Object.hasOwn(optional, key)),
						),
					);
					return { ...el, properties };
				})
		: raw.elements;

	return upgradeDiagramDocument({
		schemaVersion: 1,
		id,
		name: 'My diagram',
		createdAt: now,
		updatedAt: now,
		origin: 'local',
		diagram: { ...raw, elements },
	});
}

export function validateContextSeed(seed: unknown): Record<string, unknown> {
	const value = record(seed, 'contextSeed');
	validateJsonData(value);
	check(
		new TextEncoder().encode(JSON.stringify(value)).length <= 1024 * 1024,
		'contextSeed',
		'maximum size is 1 MiB',
	);
	return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
}
