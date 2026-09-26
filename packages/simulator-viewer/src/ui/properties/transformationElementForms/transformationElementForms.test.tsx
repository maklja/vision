// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BufferCountElementPropertiesForm } from './BufferCountElementPropertiesForm';
import { BufferTimeElementPropertiesForm } from './BufferTimeElementPropertiesForm';
import { BufferToggleElementPropertiesForm } from './BufferToggleElementPropertiesForm';
import { BufferWhenElementPropertiesForm } from './BufferWhenElementPropertiesForm';
import { ConcatMapElementPropertiesForm } from './ConcatMapElementPropertiesForm';
import { ExhaustMapElementPropertiesForm } from './ExhaustMapElementPropertiesForm';
import { ExpandElementPropertiesForm } from './ExpandElementPropertiesForm';
import { MapElementPropertiesForm } from './MapElementPropertiesForm';
import { MergeMapElementPropertiesForm } from './MergeMapElementPropertiesForm';

const editor = () => screen.getByTestId('monaco-editor') as HTMLTextAreaElement;

afterEach(() => {
	cleanup();
});

describe('BufferCountElementPropertiesForm', () => {
	it('reports the buffer size and start buffer every values', () => {
		const onPropertyValueChange = vi.fn();
		render(
			<BufferCountElementPropertiesForm
				id="buffer-count-1"
				properties={{ bufferSize: 3, startBufferEvery: 2 }}
				onPropertyValueChange={onPropertyValueChange}
			/>,
		);

		expect((screen.getByLabelText('Buffer size') as HTMLInputElement).value).toBe('3');
		expect((screen.getByLabelText('Start buffer every') as HTMLInputElement).value).toBe('2');

		fireEvent.change(screen.getByLabelText('Buffer size'), { target: { value: '5' } });
		fireEvent.change(screen.getByLabelText('Start buffer every'), { target: { value: '7' } });

		expect(onPropertyValueChange).toHaveBeenNthCalledWith(1, 'buffer-count-1', 'bufferSize', 5);
		expect(onPropertyValueChange).toHaveBeenNthCalledWith(
			2,
			'buffer-count-1',
			'startBufferEvery',
			7,
		);
	});
});

describe('BufferTimeElementPropertiesForm', () => {
	it('reports the required buffer time span', () => {
		const onPropertyValueChange = vi.fn();
		render(
			<BufferTimeElementPropertiesForm
				id="buffer-time-1"
				properties={{ bufferTimeSpan: 100 }}
				onPropertyValueChange={onPropertyValueChange}
			/>,
		);

		fireEvent.change(screen.getByLabelText('Buffer time span'), { target: { value: '250' } });

		expect(onPropertyValueChange).toHaveBeenCalledWith('buffer-time-1', 'bufferTimeSpan', 250);
	});

	it('clears and fills the optional buffer creation interval and max buffer size', () => {
		const onPropertyValueChange = vi.fn();
		render(
			<BufferTimeElementPropertiesForm
				id="buffer-time-1"
				properties={{ bufferTimeSpan: 100, bufferCreationInterval: 50, maxBufferSize: 4 }}
				onPropertyValueChange={onPropertyValueChange}
			/>,
		);

		fireEvent.change(screen.getByLabelText('Buffer creation interval'), {
			target: { value: '' },
		});
		expect(onPropertyValueChange).toHaveBeenNthCalledWith(
			1,
			'buffer-time-1',
			'bufferCreationInterval',
			undefined,
		);

		fireEvent.change(screen.getByLabelText('Max buffer size'), { target: { value: '9' } });
		expect(onPropertyValueChange).toHaveBeenNthCalledWith(2, 'buffer-time-1', 'maxBufferSize', 9);
	});

	it('leaves the optional inputs empty for an absent value', () => {
		render(
			<BufferTimeElementPropertiesForm
				id="buffer-time-1"
				properties={{ bufferTimeSpan: 100 }}
			/>,
		);

		expect((screen.getByLabelText('Buffer creation interval') as HTMLInputElement).value).toBe('');
		expect((screen.getByLabelText('Max buffer size') as HTMLInputElement).value).toBe('');
	});
});

describe('BufferToggleElementPropertiesForm', () => {
	it('reports the closing selector expression', () => {
		const onPropertyValueChange = vi.fn();
		render(
			<BufferToggleElementPropertiesForm
				id="buffer-toggle-1"
				properties={{ closingSelectorExpression: 'a => of(1)' }}
				onPropertyValueChange={onPropertyValueChange}
			/>,
		);

		expect(screen.getAllByText('Closing selector').length).toBeGreaterThan(0);
		expect(editor().value).toBe('a => of(1)');

		fireEvent.change(editor(), { target: { value: 'a => of(2)' } });

		expect(onPropertyValueChange).toHaveBeenCalledWith(
			'buffer-toggle-1',
			'closingSelectorExpression',
			'a => of(2)',
		);
	});
});

describe('BufferWhenElementPropertiesForm', () => {
	it('reports the closing selector expression', () => {
		const onPropertyValueChange = vi.fn();
		render(
			<BufferWhenElementPropertiesForm
				id="buffer-when-1"
				properties={{ closingSelectorExpression: '() => of(1)' }}
				onPropertyValueChange={onPropertyValueChange}
			/>,
		);

		fireEvent.change(editor(), { target: { value: '() => of(2)' } });

		expect(onPropertyValueChange).toHaveBeenCalledWith(
			'buffer-when-1',
			'closingSelectorExpression',
			'() => of(2)',
		);
	});
});

describe('ConcatMapElementPropertiesForm', () => {
	it('reports the project expression', () => {
		const onPropertyValueChange = vi.fn();
		render(
			<ConcatMapElementPropertiesForm
				id="concat-map-1"
				properties={{ projectExpression: 'x => of(x)' }}
				onPropertyValueChange={onPropertyValueChange}
			/>,
		);

		expect(screen.getAllByText('Project').length).toBeGreaterThan(0);
		fireEvent.change(editor(), { target: { value: 'x => of(x + 1)' } });

		expect(onPropertyValueChange).toHaveBeenCalledWith(
			'concat-map-1',
			'projectExpression',
			'x => of(x + 1)',
		);
	});
});

describe('ExhaustMapElementPropertiesForm', () => {
	it('reports the project expression', () => {
		const onPropertyValueChange = vi.fn();
		render(
			<ExhaustMapElementPropertiesForm
				id="exhaust-map-1"
				properties={{ projectExpression: 'x => of(x)' }}
				onPropertyValueChange={onPropertyValueChange}
			/>,
		);

		fireEvent.change(editor(), { target: { value: 'x => of(x + 1)' } });

		expect(onPropertyValueChange).toHaveBeenCalledWith(
			'exhaust-map-1',
			'projectExpression',
			'x => of(x + 1)',
		);
	});
});

describe('MapElementPropertiesForm', () => {
	it('reports the project expression and explains the index argument', () => {
		const onPropertyValueChange = vi.fn();
		render(
			<MapElementPropertiesForm
				id="map-1"
				properties={{ projectExpression: 'x => x' }}
				onPropertyValueChange={onPropertyValueChange}
			/>,
		);

		expect(screen.getByText(/The index parameter is the number i for the i-th emission/)).toBeDefined();
		fireEvent.change(editor(), { target: { value: 'x => x * 2' } });

		expect(onPropertyValueChange).toHaveBeenCalledWith('map-1', 'projectExpression', 'x => x * 2');
	});
});

describe('ExpandElementPropertiesForm', () => {
	it('reports the optional concurrency and the project expression', () => {
		const onPropertyValueChange = vi.fn();
		render(
			<ExpandElementPropertiesForm
				id="expand-1"
				properties={{ concurrent: 2, projectExpression: 'x => of(x)' }}
				onPropertyValueChange={onPropertyValueChange}
			/>,
		);

		fireEvent.change(screen.getByLabelText('Concurrent'), { target: { value: '4' } });
		fireEvent.change(editor(), { target: { value: 'x => of(x + 1)' } });

		expect(onPropertyValueChange).toHaveBeenNthCalledWith(1, 'expand-1', 'concurrent', 4);
		expect(onPropertyValueChange).toHaveBeenNthCalledWith(
			2,
			'expand-1',
			'projectExpression',
			'x => of(x + 1)',
		);
	});

	it('falls back to an unbounded concurrency when the model has no value', () => {
		const onPropertyValueChange = vi.fn();
		render(
			<ExpandElementPropertiesForm
				id="expand-1"
				properties={{ projectExpression: 'x => of(x)' }}
				onPropertyValueChange={onPropertyValueChange}
			/>,
		);

		expect((screen.getByLabelText('Concurrent') as HTMLInputElement).value).toBe('');

		fireEvent.change(screen.getByLabelText('Concurrent'), { target: { value: '1' } });

		expect(onPropertyValueChange).toHaveBeenCalledWith('expand-1', 'concurrent', 1);
	});
});

describe('MergeMapElementPropertiesForm', () => {
	it('reports the concurrency and the project expression', () => {
		const onPropertyValueChange = vi.fn();
		render(
			<MergeMapElementPropertiesForm
				id="merge-map-1"
				properties={{ concurrent: 1, projectExpression: 'x => of(x)' }}
				onPropertyValueChange={onPropertyValueChange}
			/>,
		);

		fireEvent.change(screen.getByLabelText('Concurrent'), { target: { value: '3' } });
		fireEvent.change(editor(), { target: { value: 'x => of(x * 2)' } });

		expect(onPropertyValueChange).toHaveBeenNthCalledWith(1, 'merge-map-1', 'concurrent', 3);
		expect(onPropertyValueChange).toHaveBeenNthCalledWith(
			2,
			'merge-map-1',
			'projectExpression',
			'x => of(x * 2)',
		);
	});
});
