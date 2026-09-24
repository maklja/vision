import { describe, expect, it } from 'vitest';
import { currentReleaseDiagram } from '../../test/fixtures/currentReleaseDiagram';

describe('current release diagram serialization', () => {
	it('round-trips the persisted diagram fixture through JSON', () => {
		const serialized = JSON.stringify(currentReleaseDiagram);
		const restored = JSON.parse(serialized);

		expect(restored).toEqual(currentReleaseDiagram);
	});

	it('preserves the current top-level storage shape', () => {
		expect(Object.keys(currentReleaseDiagram)).toEqual([
			'elements',
			'connectLines',
			'canvasState',
			'themeId',
		]);
		expect(currentReleaseDiagram.canvasState).toEqual({
			x: -120,
			y: 45,
			scaleX: 0.85,
			scaleY: 0.85,
		});
		expect(currentReleaseDiagram.themeId).toBe('sea');
	});

	it('preserves element serialization fields and operator properties', () => {
		for (const element of currentReleaseDiagram.elements) {
			expect(Object.keys(element)).toEqual([
				'id',
				'type',
				'name',
				'x',
				'y',
				'visible',
				'properties',
			]);
		}

		expect(
			currentReleaseDiagram.elements.map(({ id, type, properties }) => ({
				id,
				type,
				properties,
			})),
		).toEqual([
			{
				id: 'source',
				type: 'of',
				properties: {
					argsFactoryExpression: 'function argsFactory() { return [1, 2, 3]; }',
				},
			},
			{
				id: 'project',
				type: 'map',
				properties: {
					projectExpression: 'function project(value) { return value * 10; }',
				},
			},
			{ id: 'sink', type: 'subscriber', properties: {} },
		]);
	});

	it('preserves connection endpoints, geometry, ordering, and names', () => {
		for (const connectLine of currentReleaseDiagram.connectLines) {
			expect(Object.keys(connectLine)).toEqual([
				'id',
				'source',
				'target',
				'points',
				'locked',
				'index',
				'name',
			]);
			expect(Object.keys(connectLine.source)).toEqual([
				'id',
				'connectPointType',
				'connectPosition',
			]);
			expect(Object.keys(connectLine.target)).toEqual([
				'id',
				'connectPointType',
				'connectPosition',
			]);
		}

		expect(currentReleaseDiagram.connectLines.map((line) => line.id)).toEqual([
			'source-project',
			'project-sink',
		]);
		expect(currentReleaseDiagram.connectLines[0].points).toEqual([
			{ x: 140, y: 120 },
			{ x: 260, y: 120 },
		]);
	});
});
