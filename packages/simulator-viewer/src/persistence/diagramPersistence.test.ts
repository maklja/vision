// @vitest-environment jsdom

import 'fake-indexeddb/auto';
import { clear } from 'idb-keyval';
import { beforeEach, describe, expect, it } from 'vitest';
import { ElementType } from '@maklja/vision-simulator-model';
import { createConnectLine, createElement } from '../test-utils';
import { createPersistedDiagram, diagramId, loadDiagram, persistDiagram } from './diagramPersistence';

describe('diagram persistence helpers', () => {
	beforeEach(async () => {
		await clear();
	});

	it('keeps the existing stored diagram key', () => {
		expect(diagramId).toBe('test');
	});

	it('serializes elements and connect lines as arrays in the stored shape', () => {
		const persisted = createPersistedDiagram({
			elements: {
				source: createElement(ElementType.Of, { id: 'source' }),
				transformation: createElement(ElementType.Map, { id: 'transformation' }),
			},
			connectLines: {
				'source-transformation': createConnectLine({ id: 'source-transformation' }),
			},
			canvasState: { x: 10, y: 20, scaleX: 2, scaleY: 3, width: 0, height: 0 },
			themeId: 'winter',
		});

		expect(Array.isArray(persisted.elements)).toBe(true);
		expect(Array.isArray(persisted.connectLines)).toBe(true);
		expect(persisted).toEqual({
			elements: [
				createElement(ElementType.Of, { id: 'source' }),
				createElement(ElementType.Map, { id: 'transformation' }),
			],
			connectLines: [createConnectLine({ id: 'source-transformation' })],
			canvasState: { x: 10, y: 20, scaleX: 2, scaleY: 3 },
			themeId: 'winter',
		});
	});

	it('excludes transient result elements while preserving editor elements', () => {
		const persisted = createPersistedDiagram({
			elements: {
				source: createElement(ElementType.Of, { id: 'source' }),
				transient: createElement(ElementType.Result, { id: 'transient' }),
			},
			connectLines: {},
			canvasState: { x: 0, y: 0, scaleX: 1, scaleY: 1 },
			themeId: 'sea',
		});

		expect(persisted.elements.map((element) => element.id)).toEqual(['source']);
	});

	it('returns no diagram when nothing is stored', async () => {
		await expect(loadDiagram()).resolves.toBeUndefined();
	});

	it('round-trips a persisted diagram through IndexedDB', async () => {
		const persisted = createPersistedDiagram({
			elements: { source: createElement(ElementType.Of, { id: 'source' }) },
			connectLines: {},
			canvasState: { x: 1, y: 2, scaleX: 3, scaleY: 4 },
			themeId: 'beige',
		});

		await persistDiagram(persisted);

		await expect(loadDiagram()).resolves.toEqual(persisted);
	});
});
