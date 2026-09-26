// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ObservableInputsType } from '@maklja/vision-simulator-model';
import { ObservableIndexedInputs } from './ObservableIndexedInputs';
import { ObservableInputs } from './ObservableInputs';
import { ObservableInputsOrder } from './ObservableInputsOrder';
import { ObservableInputsTypeSelect } from './ObservableInputsTypeSelect';
import { ObservableNamedInputs } from './ObservableNamedInputs';

afterEach(() => {
	cleanup();
});

describe('ObservableInputsTypeSelect', () => {
	it('renders the array and object options with the current value', () => {
		render(<ObservableInputsTypeSelect value={ObservableInputsType.Array} />);

		expect(screen.getByRole('combobox').textContent).toContain('Array');
	});

	it('reports the selected observable input type', () => {
		const onChange = vi.fn();
		render(<ObservableInputsTypeSelect value={ObservableInputsType.Array} onChange={onChange} />);

		fireEvent.mouseDown(screen.getByRole('combobox'));
		fireEvent.click(screen.getByRole('option', { name: 'Object' }));

		expect(onChange).toHaveBeenCalledWith(ObservableInputsType.Object);
	});
});

describe('ObservableNamedInputs', () => {
	it('renders an editable key and a read-only element name per input', () => {
		const onConnectLineNameChange = vi.fn();
		render(
			<ObservableNamedInputs
				observableInputs={[
					{ id: 'cl-1', connectLineName: 'first', targetElementName: 'of' },
					{ id: 'cl-2', connectLineName: 'second', targetElementName: 'map' },
				]}
				onConnectLineNameChange={onConnectLineNameChange}
			/>,
		);

		const keys = screen.getAllByLabelText('Key') as HTMLInputElement[];
		const names = screen.getAllByLabelText('Name') as HTMLInputElement[];
		expect(keys.map((input) => input.value)).toEqual(['first', 'second']);
		expect(names.map((input) => input.value)).toEqual(['of', 'map']);
		expect(names[0].readOnly).toBe(true);

		fireEvent.change(keys[1], { target: { value: 'renamed' } });

		expect(onConnectLineNameChange).toHaveBeenCalledWith('cl-2', 'renamed');
	});

	it('shows an empty state without observable inputs', () => {
		render(<ObservableNamedInputs observableInputs={[]} />);

		expect(screen.getByText('No observable inputs')).toBeDefined();
	});
});

describe('ObservableIndexedInputs', () => {
	it('renders an editable index and a read-only element name per input', () => {
		const onConnectLineIndexChange = vi.fn();
		render(
			<ObservableIndexedInputs
				observableInputs={[
					{ id: 'cl-1', index: 1, name: 'of' },
					{ id: 'cl-2', index: 2, name: 'map' },
				]}
				onConnectLineIndexChange={onConnectLineIndexChange}
			/>,
		);

		const indexes = screen.getAllByLabelText('Index') as HTMLInputElement[];
		expect(indexes.map((input) => input.value)).toEqual(['1', '2']);
		expect((screen.getAllByLabelText('Name')[1] as HTMLInputElement).readOnly).toBe(true);

		fireEvent.change(indexes[1], { target: { value: '5' } });

		expect(onConnectLineIndexChange).toHaveBeenCalledWith('cl-2', 5);
	});

	it('treats an emptied index input as zero', () => {
		const onConnectLineIndexChange = vi.fn();
		render(
			<ObservableIndexedInputs
				observableInputs={[{ id: 'cl-1', index: 4, name: 'of' }]}
				onConnectLineIndexChange={onConnectLineIndexChange}
			/>,
		);

		fireEvent.change(screen.getByLabelText('Index'), { target: { value: '' } });

		expect(onConnectLineIndexChange).toHaveBeenCalledWith('cl-1', 0);
	});

	it('shows an empty state without observable inputs', () => {
		render(<ObservableIndexedInputs observableInputs={[]} />);

		expect(screen.getByText('No observable inputs')).toBeDefined();
	});
});

describe('ObservableInputs', () => {
	it('renders the type select and the array inputs for the array mode', () => {
		render(
			<ObservableInputs
				observableInputsType={ObservableInputsType.Array}
				relatedElements={[]}
			/>,
		);

		expect(screen.getByRole('combobox')).toBeDefined();
		expect(screen.queryByText('No observable inputs')).not.toBeNull();
	});

	it('renders the object inputs for the object mode', () => {
		render(
			<ObservableInputs
				observableInputsType={ObservableInputsType.Object}
				relatedElements={[]}
			/>,
		);

		expect(screen.getByText('No observable inputs')).toBeDefined();
	});

	it('reports a type change', () => {
		const onObservableInputsTypeChange = vi.fn();
		render(
			<ObservableInputs
				observableInputsType={ObservableInputsType.Array}
				relatedElements={[]}
				onObservableInputsTypeChange={onObservableInputsTypeChange}
			/>,
		);

		fireEvent.mouseDown(screen.getByRole('combobox'));
		fireEvent.click(screen.getByRole('option', { name: 'Object' }));

		expect(onObservableInputsTypeChange).toHaveBeenCalledWith(ObservableInputsType.Object);
	});
});

describe('ObservableInputsOrder', () => {
	it('renders the order label and reports index changes', () => {
		const onConnectLineIndexChange = vi.fn();
		render(
			<ObservableInputsOrder
				relatedElements={[]}
				onConnectLineIndexChange={onConnectLineIndexChange}
			/>,
		);

		expect(screen.getByText('Observable inputs order')).toBeDefined();
		expect(screen.getByText('No observable inputs')).toBeDefined();
	});
});
