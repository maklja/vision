import { beforeEach, describe, expect, it } from 'vitest';
import { ElementType, ofElementPropsTemplate, mapElementPropsTemplate } from '@maklja/vision-simulator-model';
import { createElement, createTestStore } from '../../test-utils';

const deterministicIdPattern = /^00000000-0000-4000-8000-\d{12}$/;

describe('element slice', () => {
	it('starts empty without drafts or selection', () => {
		const store = createTestStore();

		expect(store.getState().elements).toEqual({});
		expect(store.getState().selectedElements).toEqual([]);
		expect(store.getState().draftElement).toBeNull();
	});

	describe('draft elements', () => {
		it('creates a uniquely named draft with the operator default properties', () => {
			const store = createTestStore();
			store.getState().addElement(createElement(ElementType.Of, { id: 'of-1', name: 'of_0' }));

			store.getState().createDraftElement({ type: ElementType.Of, x: 25, y: 50 });

			const draft = store.getState().draftElement;
			expect(draft).toMatchObject({
				type: ElementType.Of,
				name: 'of_1',
				x: 25,
				y: 50,
				visible: true,
				properties: ofElementPropsTemplate,
			});
			expect(draft?.id).toMatch(deterministicIdPattern);
			expect(draft).not.toBe(ofElementPropsTemplate);
		});

		it('reuses the first free index when names are already taken non-sequentially', () => {
			const store = createTestStore();
			store.getState().addElement(createElement(ElementType.Of, { id: 'of-2', name: 'of_2' }));

			store.getState().createDraftElement({ type: ElementType.Of, x: 0, y: 0 });

			expect(store.getState().draftElement?.name).toBe('of_0');
		});

		it('updates the draft position but ignores updates without a draft', () => {
			const store = createTestStore();

			store.getState().updateDraftElementPosition({ x: 10, y: 20 });
			expect(store.getState().draftElement).toBeNull();

			store.getState().createDraftElement({ type: ElementType.Map, x: 0, y: 0 });
			store.getState().updateDraftElementPosition({ x: 10, y: 20 });

			expect(store.getState().draftElement).toMatchObject({ x: 10, y: 20 });
		});

		it('clears a committed draft and keeps its default properties', () => {
			const store = createTestStore();
			store.getState().createDraftElement({ type: ElementType.Map, x: 5, y: 6 });
			const draftId = store.getState().draftElement!.id;

			store.getState().addElement(store.getState().draftElement!);
			store.getState().clearDraftElement();

			expect(store.getState().draftElement).toBeNull();
			expect(store.getState().elements[draftId]).toMatchObject({
				id: draftId,
				type: ElementType.Map,
				x: 5,
				y: 6,
				properties: mapElementPropsTemplate,
			});
		});
	});

	describe('element mutations', () => {
		let store: ReturnType<typeof createTestStore>;

		beforeEach(() => {
			store = createTestStore();
			store.getState().addElement(
				createElement(ElementType.Of, {
					id: 'of-1',
					name: 'of_0',
					x: 10,
					y: 20,
					properties: { argsFactoryExpression: 'function argsFactory() { return [1]; }' },
				}),
			);
		});

		it('loads elements into a keyed record', () => {
			const store2 = createTestStore();
			store2.getState().loadElements([
				createElement(ElementType.Of, { id: 'a' }),
				createElement(ElementType.Map, { id: 'b' }),
			]);

			expect(Object.keys(store2.getState().elements).sort()).toEqual(['a', 'b']);
			expect(store2.getState().elements.b.type).toBe(ElementType.Map);
		});

		it('replaces the whole element record when loading', () => {
			store.getState().loadElements([createElement(ElementType.Filter, { id: 'filter-1' })]);

			expect(Object.keys(store.getState().elements)).toEqual(['filter-1']);
		});

		it('updates names, visibility and merges properties', () => {
			store.getState().updateElement({
				id: 'of-1',
				name: 'renamed',
				visible: false,
				properties: { additionalProperty: true },
			});

			expect(store.getState().elements['of-1']).toMatchObject({
				name: 'renamed',
				visible: false,
				properties: {
					argsFactoryExpression: 'function argsFactory() { return [1]; }',
					additionalProperty: true,
				},
			});
		});

		it('keeps existing values when update fields are omitted', () => {
			store.getState().updateElement({ id: 'of-1' });

			expect(store.getState().elements['of-1']).toMatchObject({
				name: 'of_0',
				visible: true,
				properties: { argsFactoryExpression: 'function argsFactory() { return [1]; }' },
			});
		});

		it('ignores updates for missing elements', () => {
			const before = store.getState().elements;

			store.getState().updateElement({ id: 'missing', name: 'nope' });
			store.getState().updateElementProperty({
				id: 'missing',
				propertyName: 'x',
				propertyValue: 1,
			});
			store.getState().moveElementToPosition({ id: 'missing', x: 1, y: 1 });
			store.getState().moveElementByDelta({ id: 'missing', dx: 1, dy: 1 });

			expect(store.getState().elements).toBe(before);
		});

		it('updates a single property in place', () => {
			store.getState().updateElementProperty({
				id: 'of-1',
				propertyName: 'argsFactoryExpression',
				propertyValue: 'function argsFactory() { return [2, 3]; }',
			});

			expect(store.getState().elements['of-1'].properties).toMatchObject({
				argsFactoryExpression: 'function argsFactory() { return [2, 3]; }',
			});
		});

		it('moves elements to an absolute position and by relative delta', () => {
			store.getState().moveElementToPosition({ id: 'of-1', x: 100, y: 200 });
			expect(store.getState().elements['of-1']).toMatchObject({ x: 100, y: 200 });

			store.getState().moveElementByDelta({ id: 'of-1', dx: -10, dy: 5 });
			expect(store.getState().elements['of-1']).toMatchObject({ x: 90, y: 205 });
		});

		it('renames a newly added element when its name collides', () => {
			store.getState().addElement(createElement(ElementType.Of, { id: 'of-2', name: 'of_0' }));

			expect(store.getState().elements['of-2'].name).toBe('of_1');
		});

		it('removes elements by id and ignores an empty removal', () => {
			store.getState().addElement(createElement(ElementType.Map, { id: 'map-1' }));
			const before = store.getState().elements;

			store.getState().removeElements([]);
			expect(store.getState().elements).toBe(before);

			store.getState().removeElements(['of-1', 'map-1']);
			expect(store.getState().elements).toEqual({});
		});
	});

	describe('selection', () => {
		let store: ReturnType<typeof createTestStore>;

		beforeEach(() => {
			store = createTestStore();
			store.getState().loadElements([
				createElement(ElementType.Of, { id: 'a' }),
				createElement(ElementType.Map, { id: 'b' }),
			]);
		});

		it('selects and deselects a single element without duplicates', () => {
			store.getState().selectElement('a');
			store.getState().selectElement('a');
			store.getState().deselectElement('b');

			expect(store.getState().selectedElements).toEqual(['a']);
		});

		it('deselects a selected element', () => {
			store.getState().setSelectElements(['a', 'b']);
			store.getState().deselectElement('a');

			expect(store.getState().selectedElements).toEqual(['b']);
		});

		it('replaces the selection and interrupts empty-to-empty updates', () => {
			const before = store.getState().selectedElements;

			store.getState().setSelectElements([]);
			expect(store.getState().selectedElements).toBe(before);

			store.getState().setSelectElements(['a', 'b']);
			expect(store.getState().selectedElements).toEqual(['a', 'b']);
		});
	});
});
