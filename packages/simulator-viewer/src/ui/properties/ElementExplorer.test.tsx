// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ElementType } from '@maklja/vision-simulator-model';
import { createElement, createStoreWrapper, createTestStore } from '../../test-utils';
import { ElementExplorer } from './ElementExplorer';

function renderExplorer(
	element = createElement(ElementType.Of, { id: 'of-1', name: 'zeta', x: 0, y: 0 }),
	elementNames: string[] = [],
	handlers: {
		onNameChange?: (id: string, name: string) => void;
		onPositionChange?: (id: string, position: { x: number; y: number }) => void;
	} = {},
) {
	const store = createTestStore();
	const Wrapper = createStoreWrapper(store);
	const result = render(
		<Wrapper>
			<ElementExplorer element={element} elementNames={elementNames} {...handlers} />
		</Wrapper>,
	);
	return { ...result, store };
}

describe('ElementExplorer', () => {
	afterEach(() => {
		cleanup();
	});

	it('shows the read-only element details and editable name and position', () => {
		renderExplorer(createElement(ElementType.Of, { id: 'of-1', name: 'zeta', x: 5, y: 7 }));

		expect(screen.getByText('Element explorer')).toBeDefined();
		expect((screen.getByLabelText('Id') as HTMLInputElement).value).toBe('of-1');
		expect((screen.getByLabelText('Type') as HTMLInputElement).value).toBe(ElementType.Of);
		expect((screen.getByLabelText('Group') as HTMLInputElement).value).toBe('creation');
		expect((screen.getByLabelText('Id') as HTMLInputElement).readOnly).toBe(true);
		expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('zeta');
		expect((screen.getByLabelText('X') as HTMLInputElement).value).toBe('5');
		expect((screen.getByLabelText('Y') as HTMLInputElement).value).toBe('7');
	});

	it('shows a radius for circle operators and a width and height for rectangles', () => {
		renderExplorer(createElement(ElementType.Of, { id: 'of-1' }));
		expect((screen.getByLabelText('Radius') as HTMLInputElement).value).toBe('50');
		expect(screen.queryByLabelText('Width')).toBeNull();
		cleanup();

		renderExplorer(createElement(ElementType.Map, { id: 'map-1' }));
		expect((screen.getByLabelText('Width') as HTMLInputElement).value).toBe('125');
		expect((screen.getByLabelText('Height') as HTMLInputElement).value).toBe('100');
		expect(screen.queryByLabelText('Radius')).toBeNull();
	});

	it('reports every typed name', () => {
		const onNameChange = vi.fn();
		renderExplorer(undefined, [], { onNameChange });

		fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'renamed' } });

		expect(onNameChange).toHaveBeenCalledWith('of-1', 'renamed');
	});

	it('shows a required-name validation message', () => {
		renderExplorer(createElement(ElementType.Of, { id: 'of-1', name: '' }));

		expect(screen.getByText('Name is required')).toBeDefined();
	});

	it('shows a unique-name validation message', () => {
		renderExplorer(createElement(ElementType.Of, { id: 'of-1', name: 'dup' }), ['dup']);

		expect(screen.getByText('Name must be unique')).toBeDefined();
	});

	it('rolls an invalid name back to the last committed name on blur', () => {
		const onNameChange = vi.fn();
		renderExplorer(undefined, [], { onNameChange });

		const nameInput = screen.getByLabelText('Name');
		fireEvent.change(nameInput, { target: { value: '' } });
		fireEvent.blur(nameInput);

		expect(onNameChange).toHaveBeenNthCalledWith(1, 'of-1', '');
		expect(onNameChange).toHaveBeenNthCalledWith(2, 'of-1', 'zeta');
		expect(onNameChange).toHaveBeenCalledTimes(2);
	});

	it('does not roll a valid name back on blur', () => {
		const onNameChange = vi.fn();
		renderExplorer(undefined, [], { onNameChange });

		const nameInput = screen.getByLabelText('Name');
		fireEvent.change(nameInput, { target: { value: 'renamed' } });
		fireEvent.blur(nameInput);

		expect(onNameChange).toHaveBeenCalledTimes(1);
	});

	it('rolls an invalid name back when the explorer unmounts', () => {
		const onNameChange = vi.fn();
		const { unmount } = renderExplorer(undefined, [], { onNameChange });

		fireEvent.change(screen.getByLabelText('Name'), { target: { value: '' } });
		unmount();

		expect(onNameChange).toHaveBeenNthCalledWith(1, 'of-1', '');
		expect(onNameChange).toHaveBeenNthCalledWith(2, 'of-1', 'zeta');
	});

	it('does not roll a valid name back when the explorer unmounts', () => {
		const onNameChange = vi.fn();
		const { unmount } = renderExplorer(undefined, [], { onNameChange });

		fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'renamed' } });
		unmount();

		expect(onNameChange).toHaveBeenCalledTimes(1);
	});

	it('reports parsed X and Y positions', () => {
		const onPositionChange = vi.fn();
		renderExplorer(undefined, [], { onPositionChange });

		fireEvent.change(screen.getByLabelText('X'), { target: { value: '12' } });
		fireEvent.change(screen.getByLabelText('Y'), { target: { value: '34' } });

		expect(onPositionChange).toHaveBeenNthCalledWith(1, 'of-1', { x: 12, y: 0 });
		expect(onPositionChange).toHaveBeenNthCalledWith(2, 'of-1', { x: 0, y: 34 });
	});

	it('reports zero for characters a number input drops', () => {
		// Number inputs reject non-numeric characters, so the browser reports an empty value and
		// Number('') is 0. The `isNaN` guard inside the change handlers is therefore unreachable
		// through the current number inputs and only a non-numeric input type could exercise it.
		const onPositionChange = vi.fn();
		renderExplorer(createElement(ElementType.Of, { id: 'of-1', x: 3, y: 4 }), [], {
			onPositionChange,
		});

		fireEvent.change(screen.getByLabelText('X'), { target: { value: 'abc' } });
		fireEvent.change(screen.getByLabelText('Y'), { target: { value: 'abc' } });

		expect(onPositionChange).toHaveBeenNthCalledWith(1, 'of-1', { x: 0, y: 4 });
		expect(onPositionChange).toHaveBeenNthCalledWith(2, 'of-1', { x: 3, y: 0 });
	});
});
