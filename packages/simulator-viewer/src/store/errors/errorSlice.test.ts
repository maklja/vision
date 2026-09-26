import { describe, expect, it } from 'vitest';
import { createTestStore } from '../../test-utils';
import { selectElementErrorById } from './errorSlice';

describe('error slice', () => {
	it('starts without errors', () => {
		const store = createTestStore();

		expect(store.getState().errors).toEqual({});
		expect(selectElementErrorById('of-1')(store.getState())).toBeUndefined();
	});

	it('creates an element error keyed by element id', () => {
		const store = createTestStore();

		store.getState().createElementError({
			elementId: 'of-1',
			errorId: 'error-1',
			errorMessage: 'boom',
		});

		expect(store.getState().errors).toEqual({
			'of-1': { errorId: 'error-1', errorMessage: 'boom' },
		});
		expect(selectElementErrorById('of-1')(store.getState())).toEqual({
			errorId: 'error-1',
			errorMessage: 'boom',
		});
	});

	it('replaces an existing error for the same element', () => {
		const store = createTestStore();
		store.getState().createElementError({
			elementId: 'of-1',
			errorId: 'error-1',
			errorMessage: 'boom',
		});

		store.getState().createElementError({
			elementId: 'of-1',
			errorId: 'error-2',
			errorMessage: 'boom again',
		});

		expect(store.getState().errors['of-1']).toEqual({
			errorId: 'error-2',
			errorMessage: 'boom again',
		});
	});

	it('tracks errors for several elements and clears them', () => {
		const store = createTestStore();
		store.getState().createElementError({
			elementId: 'of-1',
			errorId: 'error-1',
			errorMessage: 'boom',
		});
		store.getState().createElementError({
			elementId: 'map-1',
			errorId: 'error-2',
			errorMessage: 'boom',
		});

		store.getState().clearErrors();

		expect(store.getState().errors).toEqual({});
	});

	it('returns null when no element id is provided', () => {
		const store = createTestStore();

		expect(selectElementErrorById(null)(store.getState())).toBeNull();
		expect(selectElementErrorById('')(store.getState())).toBeNull();
	});
});
