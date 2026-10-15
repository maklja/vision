import { describe, expect, it } from 'vitest';
import { currentReleaseDiagram } from '../../test/fixtures/currentReleaseDiagram';
import { ElementType, mapToOperatorPropsTemplate } from '../index';
import {
	DiagramData,
	MAX_DIAGRAM_BYTES,
	migrateLegacyDiagram,
	parseDiagramFile,
	validateDiagramData,
	validateDiagramDocument,
	validateJsonData,
} from './diagramDocument';

const now = '2026-10-15T19:00:00.000Z';
const fixture = () => structuredClone(currentReleaseDiagram);
const document = () => migrateLegacyDiagram(fixture(), 'diagram-1', now);

describe('versioned diagram data', () => {
	it('migrates the current release without changing callbacks, IDs, connections or viewport', () => {
		const doc = document();
		expect(doc).toMatchObject({
			schemaVersion: 1,
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
		expect(migrateLegacyDiagram(data, 'x', now).diagram).toEqual(data);
		data.elements[0].properties.count = undefined;
		expect(migrateLegacyDiagram(data, 'x', now).diagram.elements[0].properties).toEqual({
			start: 0,
		});
	});

	it('never evaluates callback text, including hostile code or Ajax sources', () => {
		const data = fixture();
		data.elements[0].properties.argsFactoryExpression =
			'(() => { throw new Error("DO NOT RUN"); })()';
		expect(
			parseDiagramFile(JSON.stringify(migrateLegacyDiagram(data, 'x', now))).diagram,
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
	])('rejects %s with a diagnostic instead of guessing a migration', (_label, change) => {
		const data = fixture();
		change(data);
		expect(() => validateDiagramData(data)).toThrow();
	});

	it('rejects future schemas and imported permissions/hidden runtime fields', () => {
		expect(() => validateDiagramDocument({ ...document(), schemaVersion: 2 })).toThrow(
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

	it('removes only legacy transient result nodes and preserves the original object', () => {
		const data = fixture();
		data.elements.push({
			...data.elements[0],
			id: 'result',
			type: ElementType.Result,
			properties: {},
		});
		expect(migrateLegacyDiagram(data, 'x', now).diagram.elements).toHaveLength(3);
		expect(data.elements).toHaveLength(4);
	});
});

it('round-trips a fixed 2000-node migration fixture without evaluating callbacks', () => {
	const data = fixture();
	data.connectLines = [];
	data.elements = Array.from({ length: 2000 }, (_, index) => ({
		...data.elements[0],
		id: `source-${index}`,
	}));
	const migrated = migrateLegacyDiagram(data, 'large-fixture', now);
	expect(migrated.diagram.elements).toHaveLength(2000);
	expect(parseDiagramFile(JSON.stringify(migrated))).toEqual(migrated);
});
