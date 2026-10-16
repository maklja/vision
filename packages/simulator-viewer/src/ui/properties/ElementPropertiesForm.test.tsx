// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	CommonProps,
	ConnectPointPosition,
	ConnectPointType,
	ElementType,
	DueDateType,
	fromOperatorDefinition,
	ObservableInputsType,
} from '@maklja/vision-simulator-model';
import { FromElementPropertiesForm } from './creationElementForms/FromElementPropertiesForm';
import { createConnectLine, createElement } from '../../test-utils';
import { ElementPropertiesForm, RelatedElements } from './ElementPropertiesForm';

const relatedElements: RelatedElements = [
	{
		connectLine: createConnectLine({
			id: 'cl-event',
			source: {
				id: 'of-1',
				connectPointType: ConnectPointType.Event,
				connectPosition: ConnectPointPosition.Right,
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
			id: 'cl-input',
			source: {
				id: 'of-1',
				connectPointType: ConnectPointType.Output,
				connectPosition: ConnectPointPosition.Right,
			},
			target: {
				id: 'combine-1',
				connectPointType: ConnectPointType.Input,
				connectPosition: ConnectPointPosition.Left,
			},
		}),
		element: createElement(ElementType.Of, { id: 'of-1' }),
	},
];

function renderForm(
	type: ElementType,
	elementProps: {
		id?: string;
		properties?: Record<string, unknown>;
		relatedElements?: RelatedElements;
		onPropertyValueChange?: (id: string, propertyName: string, propertyValue: unknown) => void;
		onConnectLineChange?: (id: string, changes: { index?: number; name?: string }) => void;
	} = {},
) {
	const element = createElement(type, {
		id: elementProps.id ?? `${type}-1`,
		...(elementProps.properties ? { properties: elementProps.properties } : {}),
	});
	render(
		<ElementPropertiesForm
			element={element}
			relatedElements={elementProps.relatedElements ?? []}
			onPropertyValueChange={elementProps.onPropertyValueChange}
			onConnectLineChange={elementProps.onConnectLineChange}
		/>,
	);
	return element;
}

const supportedForms: [ElementType, string[]][] = [
	[ElementType.Defer, ['Observable factory']],
	[ElementType.Interval, ['Period']],
	[ElementType.From, ['Observable event', 'Input']],
	[ElementType.Range, ['Start', 'Count']],
	[ElementType.ThrowError, ['Error factory']],
	[ElementType.Ajax, ['Url', 'Method']],
	[ElementType.Generate, ['Initial state', 'Condition', 'Iterate', 'Result selector']],
	[ElementType.Timer, ['Due date type']],
	[ElementType.IIf, ['Condition', 'True result', 'False result']],
	[ElementType.CombineLatest, ['Observable inputs']],
	[ElementType.ForkJoin, ['Observable inputs']],
	[ElementType.Merge, ['Limit concurrent', 'Observable inputs order']],
	[ElementType.Concat, ['Observable inputs order']],
	[ElementType.Zip, ['Observable inputs order']],
	[ElementType.Race, ['Observable inputs order']],
	[ElementType.BufferCount, ['Buffer size', 'Start buffer every']],
	[ElementType.BufferTime, ['Buffer time span', 'Buffer creation interval', 'Max buffer size']],
	[ElementType.BufferToggle, ['Closing selector']],
	[ElementType.BufferWhen, ['Closing selector']],
	[ElementType.ConcatMap, ['Project']],
	[ElementType.Expand, ['Concurrent', 'Project']],
	[ElementType.ExhaustMap, ['Project']],
	[ElementType.Map, ['Project']],
	[ElementType.MergeMap, ['Concurrent', 'Project']],
	[ElementType.CatchError, ['Project']],
	[ElementType.Of, ['Arguments factory']],
];

const unsupportedForms: ElementType[] = [
	ElementType.Buffer,
	ElementType.Empty,
	ElementType.Filter,
	ElementType.Subscriber,
	ElementType.Result,
	ElementType.ConnectPoint,
];

describe('ElementPropertiesForm dispatcher', () => {
	afterEach(() => {
		cleanup();
	});

	it.each(supportedForms)('renders the property form of %s', (type, expectedLabels) => {
		renderForm(type);

		expect(screen.getByText('Element properties')).toBeDefined();
		for (const label of expectedLabels) {
			expect(screen.getAllByText(label).length).toBeGreaterThan(0);
		}
	});

	it.each(unsupportedForms)('renders nothing for %s', (type) => {
		const { container } = render(
			<ElementPropertiesForm element={createElement(type)} relatedElements={[]} />,
		);

		expect(container.textContent).toBe('');
	});

	it('forwards number input changes with the element id and property name', () => {
		const onPropertyValueChange = vi.fn();
		renderForm(ElementType.Interval, {
			id: 'interval-1',
			properties: { period: 1_000 },
			onPropertyValueChange,
		});

		fireEvent.change(screen.getByLabelText('Period'), { target: { value: '2500' } });

		expect(onPropertyValueChange).toHaveBeenCalledWith('interval-1', 'period', 2500);
	});

	it('forwards code editor changes with the element id and property name', () => {
		const onPropertyValueChange = vi.fn();
		renderForm(ElementType.Map, {
			id: 'map-1',
			properties: { projectExpression: 'x => x' },
			onPropertyValueChange,
		});

		const editor = screen.getByTestId('monaco-editor') as HTMLTextAreaElement;
		expect(editor.defaultValue).toBe('x => x');
		fireEvent.change(editor, { target: { value: 'x => x * 2' } });

		expect(onPropertyValueChange).toHaveBeenCalledWith(
			'map-1',
			'projectExpression',
			'x => x * 2',
		);
	});

	it('forwards connect line index changes for join creation forms that order inputs', () => {
		const onConnectLineChange = vi.fn();
		renderForm(ElementType.Merge, {
			id: 'merge-1',
			properties: { limitConcurrent: 1 },
			relatedElements,
			onConnectLineChange,
		});

		fireEvent.change(screen.getByLabelText('Index'), { target: { value: '3' } });

		expect(onConnectLineChange).toHaveBeenCalledWith('cl-event', { index: 3 });
	});

	it('forwards connect line name changes for named observable inputs', () => {
		const onConnectLineChange = vi.fn();
		renderForm(ElementType.CombineLatest, {
			id: 'combine-1',
			properties: { [CommonProps.ObservableInputsType]: ObservableInputsType.Object },
			relatedElements,
			onConnectLineChange,
		});

		fireEvent.change(screen.getByLabelText('Key'), { target: { value: 'renamed' } });

		expect(onConnectLineChange).toHaveBeenCalledWith('cl-event', { name: 'renamed' });
	});

	it('switches the observable input mode through the model property', () => {
		const onPropertyValueChange = vi.fn();
		renderForm(ElementType.ForkJoin, {
			id: 'fork-1',
			properties: { [CommonProps.ObservableInputsType]: ObservableInputsType.Array },
			relatedElements,
			onPropertyValueChange,
		});

		expect(screen.getAllByText('Index').length).toBeGreaterThan(0);
		expect(screen.getAllByLabelText('Index')).toHaveLength(1);

		fireEvent.mouseDown(screen.getByRole('combobox'));
		fireEvent.click(screen.getByRole('option', { name: 'Object' }));

		expect(onPropertyValueChange).toHaveBeenCalledWith(
			'fork-1',
			CommonProps.ObservableInputsType,
			ObservableInputsType.Object,
		);
	});

	it('keeps From callback fields and authored drafts separate across mode changes', () => {
		const onPropertyValueChange = vi.fn();
		const properties = {
			...fromOperatorDefinition.defaults,
			inputCallbackExpression: 'function input() { return [42]; }',
			observableFactory: 'function input() { return createObservable({ count: 2 }); }',
		};
		const view = render(
			<FromElementPropertiesForm
				id="from-modes"
				properties={properties}
				onPropertyValueChange={onPropertyValueChange}
			/>,
		);
		expect((screen.getByTestId('monaco-editor') as HTMLTextAreaElement).value).toBe(
			properties.observableFactory,
		);
		fireEvent.change(screen.getByTestId('monaco-editor'), {
			target: { value: 'function input() { return createObservable(); }' },
		});
		expect(onPropertyValueChange).toHaveBeenLastCalledWith(
			'from-modes',
			'observableFactory',
			'function input() { return createObservable(); }',
		);
		fireEvent.click(screen.getByRole('checkbox', { name: 'Observable event' }));
		expect(onPropertyValueChange).toHaveBeenLastCalledWith(
			'from-modes',
			'enableObservableEvent',
			false,
		);
		view.rerender(
			<FromElementPropertiesForm
				id="from-modes"
				properties={{ ...properties, enableObservableEvent: false }}
				onPropertyValueChange={onPropertyValueChange}
			/>,
		);
		expect((screen.getByTestId('monaco-editor') as HTMLTextAreaElement).value).toBe(
			properties.inputCallbackExpression,
		);
		fireEvent.change(screen.getByTestId('monaco-editor'), {
			target: { value: 'function input() { return [0]; }' },
		});
		expect(onPropertyValueChange).toHaveBeenLastCalledWith(
			'from-modes',
			'inputCallbackExpression',
			'function input() { return [0]; }',
		);
		expect(properties.observableFactory).toBe(
			'function input() { return createObservable({ count: 2 }); }',
		);
	});

	it('keeps Timer mode choices numeric and preserves date-mode initialization', () => {
		vi.useFakeTimers();
		const now = Date.UTC(2026, 9, 16, 12);
		vi.setSystemTime(now);
		try {
			const onPropertyValueChange = vi.fn();
			renderForm(ElementType.Timer, { id: 'timer-mode', onPropertyValueChange });
			expect((screen.getByLabelText('Due milliseconds') as HTMLInputElement).value).toBe(
				'1000',
			);
			expect((screen.getByLabelText('Interval duration') as HTMLInputElement).value).toBe(
				'-1',
			);
			fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Due date type' }));
			fireEvent.click(screen.getByRole('option', { name: 'Date' }));
			expect(onPropertyValueChange.mock.calls).toEqual([
				['timer-mode', 'startDue', now + 60000],
				['timer-mode', 'dueDateType', DueDateType.Date],
			]);
		} finally {
			vi.useRealTimers();
		}
	});
});
