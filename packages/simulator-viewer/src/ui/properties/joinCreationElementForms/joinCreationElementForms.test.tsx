// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	CommonProps,
	ConnectPointPosition,
	ConnectPointType,
	ObservableInputsType,
} from '@maklja/vision-simulator-model';
import { createConnectLine, createElement } from '../../../test-utils';
import { RelatedElements } from '../ElementPropertiesForm';
import { ElementType } from '@maklja/vision-simulator-model';
import { CombineLatestElementPropertiesForm } from './CombineLatestElementPropertiesForm';
import { ForkJoinElementPropertiesForm } from './ForkJoinElementPropertiesForm';
import { JoinCreationElementForm } from './JoinCreationElementForm';
import { MergeElementPropertiesForm } from './MergeElementPropertiesForm';

const relatedElements: RelatedElements = [
	{
		connectLine: createConnectLine({
			id: 'cl-event',
			source: {
				id: 'merge-1',
				connectPointType: ConnectPointType.Event,
				connectPosition: ConnectPointPosition.Top,
			},
			target: {
				id: 'combine-1',
				connectPointType: ConnectPointType.Input,
				connectPosition: ConnectPointPosition.Left,
			},
			index: 2,
			name: 'source',
		}),
		element: createElement(ElementType.Of, { id: 'of-1' }),
	},
	{
		connectLine: createConnectLine({
			id: 'cl-output',
			source: {
				id: 'merge-1',
				connectPointType: ConnectPointType.Output,
				connectPosition: ConnectPointPosition.Right,
			},
			target: {
				id: 'combine-1',
				connectPointType: ConnectPointType.Input,
				connectPosition: ConnectPointPosition.Left,
			},
		}),
		element: createElement(ElementType.Map, { id: 'map-1' }),
	},
];

afterEach(() => {
	cleanup();
});

describe('MergeElementPropertiesForm', () => {
	it('reports the concurrency limit and the input order', () => {
		const onPropertyValueChange = vi.fn();
		const onConnectLineChange = vi.fn();
		render(
			<MergeElementPropertiesForm
				id="merge-1"
				properties={{ limitConcurrent: 1 }}
				relatedElements={relatedElements}
				onPropertyValueChange={onPropertyValueChange}
				onConnectLineChange={onConnectLineChange}
			/>,
		);

		expect((screen.getByLabelText('Limit concurrent') as HTMLInputElement).value).toBe('1');
		expect(screen.getAllByLabelText('Index')).toHaveLength(1);
		expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe(ElementType.Of);

		fireEvent.change(screen.getByLabelText('Limit concurrent'), { target: { value: '3' } });
		expect(onPropertyValueChange).toHaveBeenCalledWith('merge-1', 'limitConcurrent', 3);

		fireEvent.change(screen.getByLabelText('Index'), { target: { value: '5' } });
		expect(onConnectLineChange).toHaveBeenCalledWith('cl-event', { index: 5 });
	});
});

describe('CombineLatestElementPropertiesForm', () => {
	it('edits the input index in array mode', () => {
		const onPropertyValueChange = vi.fn();
		const onConnectLineChange = vi.fn();
		render(
			<CombineLatestElementPropertiesForm
				id="combine-1"
				properties={{ [CommonProps.ObservableInputsType]: ObservableInputsType.Array }}
				relatedElements={relatedElements}
				onPropertyValueChange={onPropertyValueChange}
				onConnectLineChange={onConnectLineChange}
			/>,
		);

		expect(screen.getAllByLabelText('Index')).toHaveLength(1);
		expect(screen.queryByLabelText('Key')).toBeNull();

		fireEvent.change(screen.getByLabelText('Index'), { target: { value: '7' } });

		expect(onConnectLineChange).toHaveBeenCalledWith('cl-event', { index: 7 });
	});

	it('edits the input name in object mode', () => {
		const onPropertyValueChange = vi.fn();
		const onConnectLineChange = vi.fn();
		render(
			<CombineLatestElementPropertiesForm
				id="combine-1"
				properties={{ [CommonProps.ObservableInputsType]: ObservableInputsType.Object }}
				relatedElements={relatedElements}
				onPropertyValueChange={onPropertyValueChange}
				onConnectLineChange={onConnectLineChange}
			/>,
		);

		const keyInput = screen.getByLabelText('Key') as HTMLInputElement;
		expect(keyInput.value).toBe('source');
		expect((screen.getByLabelText('Name') as HTMLInputElement).readOnly).toBe(true);
		expect(screen.queryByLabelText('Index')).toBeNull();

		fireEvent.change(keyInput, { target: { value: 'renamed' } });

		expect(onConnectLineChange).toHaveBeenCalledWith('cl-event', { name: 'renamed' });
	});

	it('reports the observable inputs type change', () => {
		const onPropertyValueChange = vi.fn();
		render(
			<CombineLatestElementPropertiesForm
				id="combine-1"
				properties={{ [CommonProps.ObservableInputsType]: ObservableInputsType.Array }}
				relatedElements={relatedElements}
				onPropertyValueChange={onPropertyValueChange}
			/>,
		);

		fireEvent.mouseDown(screen.getByRole('combobox'));
		fireEvent.click(screen.getByRole('option', { name: 'Object' }));

		expect(onPropertyValueChange).toHaveBeenCalledWith(
			'combine-1',
			CommonProps.ObservableInputsType,
			ObservableInputsType.Object,
		);
	});

	it('shows an empty state without related event inputs', () => {
		render(
			<CombineLatestElementPropertiesForm
				id="combine-1"
				properties={{ [CommonProps.ObservableInputsType]: ObservableInputsType.Array }}
				relatedElements={[]}
			/>,
		);

		expect(screen.getByText('No observable inputs')).toBeDefined();
	});
});

describe('ForkJoinElementPropertiesForm', () => {
	it('reports the observable inputs type change', () => {
		const onPropertyValueChange = vi.fn();
		render(
			<ForkJoinElementPropertiesForm
				id="fork-1"
				properties={{ [CommonProps.ObservableInputsType]: ObservableInputsType.Array }}
				relatedElements={relatedElements}
				onPropertyValueChange={onPropertyValueChange}
			/>,
		);

		fireEvent.mouseDown(screen.getByRole('combobox'));
		fireEvent.click(screen.getByRole('option', { name: 'Object' }));

		expect(onPropertyValueChange).toHaveBeenCalledWith(
			'fork-1',
			CommonProps.ObservableInputsType,
			ObservableInputsType.Object,
		);
	});
});

describe('JoinCreationElementForm', () => {
	it('reports input index changes for concat, race and zip', () => {
		const onConnectLineChange = vi.fn();
		render(
			<JoinCreationElementForm
				id="concat-1"
				relatedElements={relatedElements}
				onConnectLineChange={onConnectLineChange}
			/>,
		);

		expect(screen.getByText('Observable inputs order')).toBeDefined();
		fireEvent.change(screen.getByLabelText('Index'), { target: { value: '9' } });

		expect(onConnectLineChange).toHaveBeenCalledWith('cl-event', { index: 9 });
	});

	it('shows an empty state without related event inputs', () => {
		render(<JoinCreationElementForm id="concat-1" relatedElements={[]} />);

		expect(screen.getByText('No observable inputs')).toBeDefined();
	});

	it('tolerates a missing connect line change callback', () => {
		render(<JoinCreationElementForm id="concat-1" relatedElements={relatedElements} />);

		expect(() =>
			fireEvent.change(screen.getByLabelText('Index'), { target: { value: '2' } }),
		).not.toThrow();
	});
});
