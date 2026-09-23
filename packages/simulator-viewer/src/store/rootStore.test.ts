// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import { ElementType, ofElementPropsTemplate } from '@maklja/vision-simulator-model';
import { createRootStore } from './rootStore';
import { StageState } from './stage';

describe('createRootStore', () => {
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
	});
});
