import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
	ConnectPointPosition,
	ConnectPointType,
	ElementType,
	ofElementPropsTemplate,
} from '@maklja/vision-simulator-model';
import { createConnectLine, createElement, spyOnConsole } from '../test-utils';
import { createRootStore, StateProps, useRootStore } from './rootStore';
import { StageState } from './stage';
import { SimulationState } from './simulation';

function suppliedDiagram(): StateProps {
	return {
		elements: [
			createElement(ElementType.Of, { id: 'source', x: 20, y: 30 }),
			createElement(ElementType.Map, { id: 'transformation', x: 200, y: 30 }),
		],
		connectLines: [
			createConnectLine({
				id: 'source-transformation',
				source: {
					id: 'source',
					connectPointType: ConnectPointType.Output,
					connectPosition: ConnectPointPosition.Right,
				},
				target: {
					id: 'transformation',
					connectPointType: ConnectPointType.Input,
					connectPosition: ConnectPointPosition.Left,
				},
			}),
		],
		themeId: 'winter',
		canvasState: { x: 10, y: 20, scaleX: 2, scaleY: 3 },
	};
}

describe('createRootStore', () => {
	it('initializes an empty editor', () => {
		const store = createRootStore();
		const state = store.getState();

		expect(state.elements).toEqual({});
		expect(state.connectLines).toEqual({});
		expect(state.connectPoints).toEqual({});
		expect(state.selectedElements).toEqual([]);
		expect(state.state).toBe(StageState.Select);
		expect(state.simulation.state).toBe(SimulationState.Stopped);
		expect(state.theme.default.colors.id).toBe('sea');
		expect(state.canvasState).toMatchObject({ x: 0, y: 0, scaleX: 1, scaleY: 1 });
	});

	it('loads supplied elements, lines, theme and viewport', () => {
		const store = createRootStore(suppliedDiagram());
		const state = store.getState();

		expect(Object.keys(state.elements).sort()).toEqual(['source', 'transformation']);
		expect(state.elements.source.properties).toEqual(ofElementPropsTemplate);
		expect(Object.keys(state.connectLines)).toEqual(['source-transformation']);
		expect(state.theme.default.colors.id).toBe('winter');
		expect(state.canvasState).toMatchObject({
			x: 10,
			y: 20,
			scaleX: 2,
			scaleY: 3,
			width: 0,
			height: 0,
		});
	});

	it('derives connect points for the loaded elements', () => {
		const store = createRootStore(suppliedDiagram());
		const state = store.getState();

		expect(Object.keys(state.connectPoints).sort()).toEqual(['source', 'transformation']);
		const sourcePoints = state.connectPoints.source;
		expect(sourcePoints).toHaveLength(4);
		expect(sourcePoints.find((cp) => cp.position === ConnectPointPosition.Right)).toMatchObject({
			type: ConnectPointType.Output,
			elementId: 'source',
			x: 130,
			y: 64,
		});
	});

	it('loads a diagram after creation and replaces the previous graph', () => {
		const store = createRootStore();

		store.getState().load(suppliedDiagram().elements, suppliedDiagram().connectLines);

		expect(Object.keys(store.getState().elements)).toHaveLength(2);
		expect(Object.keys(store.getState().connectLines)).toEqual(['source-transformation']);
		expect(Object.keys(store.getState().connectPoints)).toHaveLength(2);

		store.getState().load([createElement(ElementType.Of, { id: 'only' })], []);

		expect(Object.keys(store.getState().elements)).toEqual(['only']);
		expect(store.getState().connectLines).toEqual({});
		// Characterization: loading does not remove connect points of elements that are gone.
		expect(Object.keys(store.getState().connectPoints)).toEqual([
			'source',
			'transformation',
			'only',
		]);
	});

	it('creates and commits a draft element through the editor store', () => {
		const store = createRootStore();

		store.getState().startElementDraw({
			type: ElementType.Of,
			x: 25,
			y: 50,
		});

		const draftElement = store.getState().draftElement;
		expect(store.getState().state).toBe(StageState.DrawElement);
		expect(draftElement).toMatchObject({
			type: ElementType.Of,
			name: 'of_0',
			x: 25,
			y: 50,
			properties: ofElementPropsTemplate,
		});

		store.getState().addDraftElement();

		const state = store.getState();
		expect(state.state).toBe(StageState.Select);
		expect(state.draftElement).toBeNull();
		expect(Object.values(state.elements)).toHaveLength(1);
		expect(state.elements[draftElement!.id]).toMatchObject({
			type: ElementType.Of,
			name: 'of_0',
		});
		expect(state.connectPoints[draftElement!.id]).toHaveLength(4);
	});

	it('throws when the root store hook is used without a provider', () => {
		const console_ = spyOnConsole();

		expect(() => renderHook(() => useRootStore())).toThrowError(
			'Missing StoreContext.Provider in the tree.',
		);

		console_.restore();
	});
});
