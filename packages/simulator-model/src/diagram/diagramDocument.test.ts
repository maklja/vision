import { currentDiagramDocument } from '../../test/fixtures/currentDiagramDocument';
import { describe, expect, it } from 'vitest';
import { currentReleaseDiagram } from '../../test/fixtures/currentReleaseDiagram';
import {
	ElementType,
	ConnectPointType,
	ConnectPointPosition,
	mapToOperatorPropsTemplate,
} from '../index';
import {
	DiagramData,
	MAX_DIAGRAM_BYTES,
	parseDiagramFile,
	validateDiagramData,
	validateDiagramDocument,
	validateJsonData,
} from './diagramDocument';

const now = '2026-10-15T19:00:00.000Z';
const fixture = () => structuredClone(currentReleaseDiagram);
const document = () => currentDiagramDocument(fixture(), 'diagram-1', now);

describe('versioned diagram data', () => {
	it('round-trips current-schema callbacks, IDs, connections and viewport', () => {
		const doc = document();
		expect(doc).toMatchObject({
			schemaVersion: 2,
			id: 'diagram-1',
			createdAt: now,
			updatedAt: now,
			origin: 'local',
		});
		expect(doc.diagram).toEqual(currentReleaseDiagram);
		expect(parseDiagramFile(JSON.stringify(doc))).toEqual(doc);
	});

	it('accepts all current source operators with their templates and incomplete graphs as editable drafts', () => {
		for (const type of Object.values(ElementType).filter(
			(type) => type !== ElementType.Result && type !== ElementType.ConnectPoint,
		)) {
			const data = fixture();
			data.connectLines = [];
			data.elements = [
				{ ...data.elements[0], type, properties: mapToOperatorPropsTemplate(type) },
			];
			expect(validateDiagramData(data)).toEqual(data);
		}
	});

	it('preserves explicit zero, false, optional absence, date mode and the one-shot sentinel', () => {
		const data = fixture();
		data.connectLines = [];
		data.elements = [
			{ ...data.elements[0], id: 'range', type: ElementType.Range, properties: { start: 0 } },
			{
				...data.elements[0],
				id: 'from',
				type: ElementType.From,
				properties: {
					...mapToOperatorPropsTemplate(ElementType.From),
					enableObservableEvent: false,
				},
			},
			{
				...data.elements[0],
				id: 'timer',
				type: ElementType.Timer,
				properties: { dueDateType: 1, startDue: 0, intervalDuration: -1 },
			},
		];
		expect(
			currentDiagramDocument(data, 'x', now).diagram.elements.map((el) => el.properties),
		).toEqual([
			{ start: { kind: 'literal', type: 'number', value: 0 } },
			data.elements[1].properties,
			{
				dueDateType: 1,
				startDue: { kind: 'literal', type: 'date', value: 0 },
				intervalDuration: { kind: 'literal', type: 'number', value: -1 },
			},
		]);
		data.elements[0].properties.count = undefined;
		expect(() => currentDiagramDocument(data, 'x', now)).toThrow();
	});

	it('never evaluates callback text, including hostile code or Ajax sources', () => {
		const data = fixture();
		data.elements[0].properties.argsFactoryExpression =
			'(() => { throw new Error("DO NOT RUN"); })()';
		expect(
			parseDiagramFile(JSON.stringify(currentDiagramDocument(data, 'x', now))).diagram,
		).toEqual(data);
	});

	it.each([
		[
			'duplicate IDs',
			(data: DiagramData) => {
				data.elements[1].id = data.elements[0].id;
			},
		],
		[
			'missing reference',
			(data: DiagramData) => {
				data.connectLines[0].target.id = 'missing';
			},
		],
		[
			'incompatible ports',
			(data: DiagramData) => {
				data.connectLines[0].target.connectPointType =
					data.connectLines[0].source.connectPointType;
			},
		],
		[
			'invalid point',
			(data: DiagramData) => {
				data.connectLines[0].points[0].x = NaN;
			},
		],
		[
			'invalid scale',
			(data: DiagramData) => {
				data.canvasState.scaleX = 0;
			},
		],
		[
			'prototype renamed field',
			(data: DiagramData) => {
				data.elements[0].properties = { items: [1, 2] };
			},
		],
		[
			'invalid required field',
			(data: DiagramData) => {
				data.elements[0].properties = {};
			},
		],
		[
			'unknown element',
			(data: DiagramData) => {
				data.elements[0].type = 'future' as ElementType;
			},
		],
	])('rejects %s with a diagnostic without guessing a schema', (_label, change) => {
		const data = fixture();
		change(data);
		expect(() => validateDiagramData(data)).toThrow();
	});

	it('rejects future schemas and imported permissions/hidden runtime fields', () => {
		expect(() => validateDiagramDocument({ ...document(), schemaVersion: 99 })).toThrow(
			'unsupported version',
		);
		expect(() => validateDiagramDocument({ ...document(), trusted: true })).toThrow(
			'unsupported field',
		);
		expect(() => validateDiagramDocument({ ...document(), contextSeed: {} })).toThrow(
			'unsupported field',
		);
	});

	it('rejects malformed JSON, oversized input, excessive depth, dangerous keys and non-JSON values', () => {
		expect(() => parseDiagramFile('{')).toThrow('invalid JSON');
		expect(() => parseDiagramFile(' '.repeat(MAX_DIAGRAM_BYTES + 1))).toThrow('size');
		let deep: unknown = 1;
		for (let i = 0; i < 65; i++) deep = { nested: deep };
		expect(() => validateJsonData(deep)).toThrow('depth');
		expect(() => validateJsonData(JSON.parse('{"__proto__":{}}'))).toThrow('unsafe');
		expect(() => validateJsonData({ date: new Date() })).toThrow('non-JSON');
		expect(() => validateJsonData({ number: Infinity })).toThrow('finite');
		const cyclic: Record<string, unknown> = {};
		cyclic.self = cyclic;
		expect(() => validateJsonData(cyclic)).toThrow('cyclic');
	});
});

it('round-trips a fixed 2000-node current-schema fixture without evaluating callbacks', () => {
	const data = fixture();
	data.connectLines = [];
	data.elements = Array.from({ length: 2000 }, (_, index) => ({
		...data.elements[0],
		id: `source-${index}`,
	}));
	const migrated = currentDiagramDocument(data, 'large-fixture', now);
	expect(migrated.diagram.elements).toHaveLength(2000);
	expect(parseDiagramFile(JSON.stringify(migrated))).toEqual(migrated);
});

it('rejects reversed value and event connections instead of admitting a reversed pipeline', () => {
	const linear = fixture();
	[linear.connectLines[0].source, linear.connectLines[0].target] = [
		linear.connectLines[0].target,
		linear.connectLines[0].source,
	];
	expect(() => validateDiagramData(linear)).toThrow(
		'expected Output/Event source and Input target',
	);

	const event = fixture();
	event.connectLines = [event.connectLines[0]];
	event.elements[0] = { ...event.elements[0], type: ElementType.Concat, properties: {} };
	event.elements[1] = {
		...event.elements[1],
		type: ElementType.Of,
		properties: mapToOperatorPropsTemplate(ElementType.Of),
	};
	event.connectLines[0].source = {
		id: 'source',
		connectPointType: ConnectPointType.Event,
		connectPosition: ConnectPointPosition.Top,
	};
	expect(validateDiagramData(event)).toEqual(event);
	[event.connectLines[0].source, event.connectLines[0].target] = [
		event.connectLines[0].target,
		event.connectLines[0].source,
	];
	expect(() => validateDiagramData(event)).toThrow(
		'expected Output/Event source and Input target',
	);
});

it.each([0, 1, 3, 99, undefined])(
	'rejects unsupported schema %s instead of migrating it',
	(schemaVersion) => {
		const original = { ...document(), schemaVersion };
		expect(() => parseDiagramFile(JSON.stringify(original))).toThrow('unsupported version');
		expect(original.schemaVersion).toBe(schemaVersion);
	},
);

it('rejects raw numbers in v2, malformed envelopes, mode mismatches and unknown versions without guessing', () => {
	const data = fixture();
	data.connectLines = [];
	data.elements = [
		{ ...data.elements[0], type: ElementType.Interval, properties: { period: 1 } },
	];
	expect(() => validateDiagramDocument({ ...document(), diagram: data })).toThrow('parameter-v1');
	for (const period of [
		null,
		{ kind: 'expression', type: 'string', source: '1' },
		{ kind: 'literal', type: 'number', value: '1' },
		{ kind: 'expression', type: 'number', source: '1', extra: true },
	]) {
		data.elements[0].properties = { period };
		expect(() => validateDiagramDocument({ ...document(), diagram: data })).toThrow();
	}
	data.elements[0] = {
		...data.elements[0],
		type: ElementType.Timer,
		properties: {
			dueDateType: 1,
			startDue: { kind: 'literal', type: 'number', value: 0 },
			intervalDuration: { kind: 'literal', type: 'number', value: -1 },
		},
	};
	expect(() => validateDiagramDocument({ ...document(), diagram: data })).toThrow('date');
	expect(() => validateDiagramDocument({ ...document(), schemaVersion: 3 })).toThrow(
		'unsupported version',
	);
});

it('rejects unversioned files without interpreting their contents', () => {
	const original = fixture();
	expect(() => parseDiagramFile(JSON.stringify(original))).toThrow('unsupported version');
	expect(original).toEqual(currentReleaseDiagram);
});
