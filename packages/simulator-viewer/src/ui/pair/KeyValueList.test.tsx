// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { KeyValueList } from './KeyValueList';

afterEach(() => {
	cleanup();
});

describe('KeyValueList', () => {
	it('renders every pair plus a disabled placeholder row', () => {
		render(
			<KeyValueList
				label="Headers"
				data={[
					['accept', 'application/json'],
					['x-id', '1'],
				]}
			/>,
		);

		expect(screen.getByText('Headers')).toBeDefined();
		const keys = screen.getAllByLabelText('Key') as HTMLInputElement[];
		const values = screen.getAllByLabelText('Value') as HTMLInputElement[];

		expect(keys.map((input) => input.value)).toEqual(['accept', 'x-id', '']);
		expect(values.map((input) => input.value)).toEqual(['application/json', '1', '']);
		expect(keys[2].disabled).toBe(true);
		expect(values[2].disabled).toBe(true);
	});

	it('appends an empty pair through the add button', () => {
		const onChange = vi.fn();
		render(<KeyValueList label="Headers" data={[['accept', 'json']]} onChange={onChange} />);

		fireEvent.click(screen.getAllByTestId('AddCircleIcon')[0]);

		expect(onChange).toHaveBeenCalledWith([
			['accept', 'json'],
			['', ''],
		]);
	});

	it('removes a pair by index', () => {
		const onChange = vi.fn();
		render(
			<KeyValueList
				label="Headers"
				data={[
					['a', '1'],
					['b', '2'],
				]}
				onChange={onChange}
			/>,
		);

		fireEvent.click(screen.getAllByTestId('RemoveCircleIcon')[1]);

		expect(onChange).toHaveBeenCalledWith([['a', '1']]);
	});

	it('updates a key without touching the matching value', () => {
		const onChange = vi.fn();
		render(
			<KeyValueList
				label="Headers"
				data={[
					['a', '1'],
					['b', '2'],
				]}
				onChange={onChange}
			/>,
		);

		fireEvent.change(screen.getAllByLabelText('Key')[1], { target: { value: 'renamed' } });

		expect(onChange).toHaveBeenCalledWith([
			['a', '1'],
			['renamed', '2'],
		]);
	});

	it('updates a value without touching the matching key', () => {
		const onChange = vi.fn();
		render(<KeyValueList label="Headers" data={[['a', '1']]} onChange={onChange} />);

		fireEvent.change(screen.getAllByLabelText('Value')[0], { target: { value: 'updated' } });

		expect(onChange).toHaveBeenCalledWith([['a', 'updated']]);
	});

	it('does nothing without a change callback', () => {
		render(<KeyValueList label="Headers" data={[['a', '1']]} />);

		expect(() => {
			fireEvent.click(screen.getAllByTestId('AddCircleIcon')[0]);
			fireEvent.click(screen.getAllByTestId('RemoveCircleIcon')[0]);
			fireEvent.change(screen.getAllByLabelText('Key')[0], { target: { value: 'b' } });
			fireEvent.change(screen.getAllByLabelText('Value')[0], { target: { value: '2' } });
		}).not.toThrow();
	});
});
