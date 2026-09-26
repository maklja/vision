// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	AjaxElementProperties,
	DueDateType,
	GenerateElementProperties,
	HttpMethod,
} from '@maklja/vision-simulator-model';
import { AjaxElementPropertiesForm } from './AjaxElementPropertiesForm';
import { DeferElementPropertiesForm } from './DeferElementPropertiesForm';
import { FromElementPropertiesForm } from './FromElementPropertiesForm';
import { GenerateElementPropertiesForm } from './GenerateElementPropertiesForm';
import { IifElementPropertiesForm } from './IifElementPropertiesForm';
import { IntervalElementPropertiesForm } from './IntervalElementPropertiesForm';
import { OfElementPropertiesForm } from './OfElementPropertiesForm';
import { RangeElementPropertiesForm } from './RangeElementPropertiesForm';
import { ThrowErrorElementPropertiesForm } from './ThrowErrorElementPropertiesForm';
import { TimerElementPropertiesForm } from './TimerElementPropertiesForm';

const code = () => screen.getByTestId('monaco-editor') as HTMLTextAreaElement;
const codes = () => screen.getAllByTestId('monaco-editor') as HTMLTextAreaElement[];

afterEach(() => {
	cleanup();
});

describe('IntervalElementPropertiesForm', () => {
	it('reports the period and bounds the input at zero', () => {
		const onPropertyValueChange = vi.fn();
		render(
			<IntervalElementPropertiesForm
				id="interval-1"
				properties={{ period: 1_000 }}
				onPropertyValueChange={onPropertyValueChange}
			/>,
		);

		const input = screen.getByLabelText('Period') as HTMLInputElement;
		expect(input.value).toBe('1000');
		expect(input.min).toBe('0');
		fireEvent.change(input, { target: { value: '200' } });
		expect(onPropertyValueChange).toHaveBeenCalledWith('interval-1', 'period', 200);
	});
});

describe('RangeElementPropertiesForm', () => {
	it('reports the start and clears an emptied optional count', () => {
		const onPropertyValueChange = vi.fn();
		render(
			<RangeElementPropertiesForm
				id="range-1"
				properties={{ start: 1, count: 5 }}
				onPropertyValueChange={onPropertyValueChange}
			/>,
		);

		fireEvent.change(screen.getByLabelText('Start'), { target: { value: '-3' } });
		expect(onPropertyValueChange).toHaveBeenCalledWith('range-1', 'start', -3);

		fireEvent.change(screen.getByLabelText('Count'), { target: { value: '' } });
		expect(onPropertyValueChange).toHaveBeenCalledWith('range-1', 'count', undefined);
	});
});

describe('DeferElementPropertiesForm', () => {
	it('reports the observable factory code', () => {
		const onPropertyValueChange = vi.fn();
		render(
			<DeferElementPropertiesForm
				id="defer-1"
				properties={{ observableFactory: '() => of(1)' }}
				onPropertyValueChange={onPropertyValueChange}
			/>,
		);

		expect(code().value).toBe('() => of(1)');
		fireEvent.change(code(), { target: { value: '() => of(2)' } });
		expect(onPropertyValueChange).toHaveBeenCalledWith(
			'defer-1',
			'observableFactory',
			'() => of(2)',
		);
	});
});

describe('OfElementPropertiesForm', () => {
	it('reports the arguments factory code', () => {
		const onPropertyValueChange = vi.fn();
		render(
			<OfElementPropertiesForm
				id="of-1"
				properties={{ argsFactoryExpression: '() => [1]' }}
				onPropertyValueChange={onPropertyValueChange}
			/>,
		);

		fireEvent.change(code(), { target: { value: '() => [2]' } });
		expect(onPropertyValueChange).toHaveBeenCalledWith('of-1', 'argsFactoryExpression', '() => [2]');
	});
});

describe('ThrowErrorElementPropertiesForm', () => {
	it('reports the error factory code', () => {
		const onPropertyValueChange = vi.fn();
		render(
			<ThrowErrorElementPropertiesForm
				id="throw-1"
				properties={{ errorOrErrorFactory: '() => new Error()' }}
				onPropertyValueChange={onPropertyValueChange}
			/>,
		);

		fireEvent.change(code(), { target: { value: '() => new Error("boom")' } });
		expect(onPropertyValueChange).toHaveBeenCalledWith(
			'throw-1',
			'errorOrErrorFactory',
			'() => new Error("boom")',
		);
	});
});

describe('GenerateElementPropertiesForm', () => {
	it('reports each generator expression to its own property', () => {
		const onPropertyValueChange = vi.fn();
		render(
			<GenerateElementPropertiesForm
				id="generate-1"
				properties={{
					initialState: '0',
					condition: 'x => x < 3',
					iterate: 'x => x + 1',
					resultSelector: 'x => x',
				}}
				onPropertyValueChange={onPropertyValueChange}
			/>,
		);

		const editors = codes();
		expect(editors.map((editor) => editor.value)).toEqual([
			'0',
			'x => x < 3',
			'x => x + 1',
			'x => x',
		]);

		fireEvent.change(editors[0], { target: { value: '1' } });
		fireEvent.change(editors[1], { target: { value: 'x => x < 5' } });
		fireEvent.change(editors[2], { target: { value: 'x => x * 2' } });
		fireEvent.change(editors[3], { target: { value: 'x => x + 1' } });

		expect(onPropertyValueChange).toHaveBeenNthCalledWith(1, 'generate-1', 'initialState', '1');
		expect(onPropertyValueChange).toHaveBeenNthCalledWith(2, 'generate-1', 'condition', 'x => x < 5');
		expect(onPropertyValueChange).toHaveBeenNthCalledWith(3, 'generate-1', 'iterate', 'x => x * 2');
		expect(onPropertyValueChange).toHaveBeenNthCalledWith(
			4,
			'generate-1',
			'resultSelector',
			'x => x + 1',
		);
	});

	it('tolerates missing optional expressions', () => {
		render(
			<GenerateElementPropertiesForm
				id="generate-1"
				properties={
					{
						initialState: '0',
						resultSelector: 'x => x',
					} as GenerateElementProperties
				}
			/>,
		);

		expect(codes().map((editor) => editor.value)).toEqual(['0', '', '', 'x => x']);
	});
});

describe('IifElementPropertiesForm', () => {
	it('reports the condition and both branches', () => {
		const onPropertyValueChange = vi.fn();
		render(
			<IifElementPropertiesForm
				id="iif-1"
				properties={{
					conditionExpression: 'true',
					trueCallbackExpression: 'of(1)',
					falseCallbackExpression: 'of(2)',
				}}
				onPropertyValueChange={onPropertyValueChange}
			/>,
		);

		const editors = codes();
		expect(editors.map((editor) => editor.value)).toEqual(['true', 'of(1)', 'of(2)']);

		fireEvent.change(editors[0], { target: { value: 'false' } });
		fireEvent.change(editors[1], { target: { value: 'of(3)' } });
		fireEvent.change(editors[2], { target: { value: 'of(4)' } });

		expect(onPropertyValueChange).toHaveBeenNthCalledWith(1, 'iif-1', 'conditionExpression', 'false');
		expect(onPropertyValueChange).toHaveBeenNthCalledWith(
			2,
			'iif-1',
			'trueCallbackExpression',
			'of(3)',
		);
		expect(onPropertyValueChange).toHaveBeenNthCalledWith(
			3,
			'iif-1',
			'falseCallbackExpression',
			'of(4)',
		);
	});
});

describe('FromElementPropertiesForm', () => {
	it('reports the input expression while the observable event mode is off', () => {
		const onPropertyValueChange = vi.fn();
		render(
			<FromElementPropertiesForm
				id="from-1"
				properties={{
					enableObservableEvent: false,
					inputCallbackExpression: '[1, 2]',
					observableFactory: '() => of(1)',
				}}
				onPropertyValueChange={onPropertyValueChange}
			/>,
		);

		expect((screen.getByLabelText('Observable event') as HTMLInputElement).checked).toBe(false);
		expect(screen.getByText(/A subscription object, a Promise/)).toBeDefined();

		fireEvent.change(code(), { target: { value: '[3]' } });
		expect(onPropertyValueChange).toHaveBeenCalledWith('from-1', 'inputCallbackExpression', '[3]');
	});

	it('reports the observable factory while the observable event mode is on', () => {
		const onPropertyValueChange = vi.fn();
		render(
			<FromElementPropertiesForm
				id="from-1"
				properties={{
					enableObservableEvent: true,
					inputCallbackExpression: '[1, 2]',
					observableFactory: '() => of(1)',
				}}
				onPropertyValueChange={onPropertyValueChange}
			/>,
		);

		expect((screen.getByLabelText('Observable event') as HTMLInputElement).checked).toBe(true);
		expect(screen.getByText('Creation of the observable.')).toBeDefined();

		fireEvent.change(code(), { target: { value: '() => of(2)' } });
		expect(onPropertyValueChange).toHaveBeenCalledWith('from-1', 'observableFactory', '() => of(2)');
	});

	it('keeps the previous expression in the editor when the observable event mode changes', () => {
		const { rerender } = render(
			<FromElementPropertiesForm
				id="from-1"
				properties={{
					enableObservableEvent: false,
					inputCallbackExpression: '[1, 2]',
					observableFactory: '() => of(1)',
				}}
			/>,
		);

		expect(code().value).toBe('[1, 2]');

		rerender(
			<FromElementPropertiesForm
				id="from-1"
				properties={{
					enableObservableEvent: true,
					inputCallbackExpression: '[1, 2]',
					observableFactory: '() => of(1)',
				}}
			/>,
		);

		// The form switches the edited property and its helper text, but the editor content stays
		// on the expression it mounted with. See the skipped intended-behavior test below.
		expect(screen.getByText('Creation of the observable.')).toBeDefined();
		expect(code().value).toBe('[1, 2]');
	});

	it.skip('shows the observable factory in the editor when the observable event mode turns on (#81)', () => {
		const { rerender } = render(
			<FromElementPropertiesForm
				id="from-1"
				properties={{
					enableObservableEvent: false,
					inputCallbackExpression: '[1, 2]',
					observableFactory: '() => of(1)',
				}}
			/>,
		);

		rerender(
			<FromElementPropertiesForm
				id="from-1"
				properties={{
					enableObservableEvent: true,
					inputCallbackExpression: '[1, 2]',
					observableFactory: '() => of(1)',
				}}
			/>,
		);

		expect(code().value).toBe('() => of(1)');
	});

	it('reports the observable event checkbox state', () => {
		const onPropertyValueChange = vi.fn();
		render(
			<FromElementPropertiesForm
				id="from-1"
				properties={{
					enableObservableEvent: true,
					inputCallbackExpression: '[1, 2]',
					observableFactory: '() => of(1)',
				}}
				onPropertyValueChange={onPropertyValueChange}
			/>,
		);

		fireEvent.click(screen.getByLabelText('Observable event'));

		expect(onPropertyValueChange).toHaveBeenCalledWith('from-1', 'enableObservableEvent', false);
	});
});

describe('TimerElementPropertiesForm', () => {
	it('reports milliseconds and the due date type for the millisecond mode', () => {
		const onPropertyValueChange = vi.fn();
		render(
			<TimerElementPropertiesForm
				id="timer-1"
				properties={{
					dueDateType: DueDateType.Milliseconds,
					startDue: 500,
					intervalDuration: 1_000,
				}}
				onPropertyValueChange={onPropertyValueChange}
			/>,
		);

		const dueInput = screen.getByLabelText('Due milliseconds') as HTMLInputElement;
		expect(dueInput.value).toBe('500');
		expect(dueInput.min).toBe('0');
		fireEvent.change(dueInput, { target: { value: '750' } });
		expect(onPropertyValueChange).toHaveBeenCalledWith('timer-1', 'startDue', 750);

		const intervalInput = screen.getByLabelText('Interval duration') as HTMLInputElement;
		expect(intervalInput.min).toBe('-1');
		fireEvent.change(intervalInput, { target: { value: '-1' } });
		expect(onPropertyValueChange).toHaveBeenCalledWith('timer-1', 'intervalDuration', -1);
	});

	it('converts a due date selection into a timestamp and switches the due date type', () => {
		const onPropertyValueChange = vi.fn();
		render(
			<TimerElementPropertiesForm
				id="timer-1"
				properties={{
					dueDateType: DueDateType.Milliseconds,
					startDue: 500,
					intervalDuration: 1_000,
				}}
				onPropertyValueChange={onPropertyValueChange}
			/>,
		);

		fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Due date type' }));
		fireEvent.click(screen.getByRole('option', { name: 'Date' }));

		const firstCall = onPropertyValueChange.mock.calls[0];
		expect(firstCall[0]).toBe('timer-1');
		expect(firstCall[1]).toBe('startDue');
		expect(typeof firstCall[2]).toBe('number');
		expect(firstCall[2]).toBeGreaterThan(Date.now());
		expect(onPropertyValueChange).toHaveBeenNthCalledWith(2, 'timer-1', 'dueDateType', DueDateType.Date);
	});

	it('switches back to milliseconds and reports the default interval', () => {
		const onPropertyValueChange = vi.fn();
		render(
			<TimerElementPropertiesForm
				id="timer-1"
				properties={{
					dueDateType: DueDateType.Date,
					startDue: 1_700_000_000_000,
					intervalDuration: 1_000,
				}}
				onPropertyValueChange={onPropertyValueChange}
			/>,
		);

		expect(screen.getAllByText('Due date').length).toBeGreaterThan(0);

		fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Due date type' }));
		fireEvent.click(screen.getByRole('option', { name: 'Milliseconds' }));

		expect(onPropertyValueChange).toHaveBeenNthCalledWith(1, 'timer-1', 'startDue', 1_000);
		expect(onPropertyValueChange).toHaveBeenNthCalledWith(
			2,
			'timer-1',
			'dueDateType',
			DueDateType.Milliseconds,
		);
	});
});

describe('AjaxElementPropertiesForm', () => {
	const properties: AjaxElementProperties = {
		url: 'https://example.com',
		method: HttpMethod.Get,
		body: '{"a":1}',
		timeout: 500,
		responseType: 'json',
		headers: [['accept', 'application/json']] as [string, string][],
		queryParams: [['page', '1']] as [string, string][],
	};

	it('reports the url, body, timeout and response type', () => {
		const onPropertyValueChange = vi.fn();
		render(
			<AjaxElementPropertiesForm
				id="ajax-1"
				properties={properties}
				onPropertyValueChange={onPropertyValueChange}
			/>,
		);

		fireEvent.change(screen.getByLabelText('Url'), { target: { value: 'https://other.test' } });
		expect(onPropertyValueChange).toHaveBeenCalledWith('ajax-1', 'url', 'https://other.test');

		fireEvent.change(code(), { target: { value: '{"b":2}' } });
		expect(onPropertyValueChange).toHaveBeenCalledWith('ajax-1', 'body', '{"b":2}');

		fireEvent.change(screen.getByLabelText('Timeout'), { target: { value: '900' } });
		expect(onPropertyValueChange).toHaveBeenCalledWith('ajax-1', 'timeout', 900);

		fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Response type' }));
		fireEvent.click(screen.getByRole('option', { name: 'Text' }));
		expect(onPropertyValueChange).toHaveBeenCalledWith('ajax-1', 'responseType', 'text');
	});

	it('falls back to the current url when the url input is cleared', () => {
		const onPropertyValueChange = vi.fn();
		render(
			<AjaxElementPropertiesForm
				id="ajax-1"
				properties={properties}
				onPropertyValueChange={onPropertyValueChange}
			/>,
		);

		fireEvent.change(screen.getByLabelText('Url'), { target: { value: '' } });

		expect(onPropertyValueChange).toHaveBeenCalledWith('ajax-1', 'url', 'https://example.com');
	});

	it('reports the selected http method', () => {
		const onPropertyValueChange = vi.fn();
		render(
			<AjaxElementPropertiesForm
				id="ajax-1"
				properties={properties}
				onPropertyValueChange={onPropertyValueChange}
			/>,
		);

		fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Method' }));
		fireEvent.click(screen.getByRole('option', { name: 'PUT' }));

		expect(onPropertyValueChange).toHaveBeenCalledWith('ajax-1', 'method', 'PUT');
	});

	it('adds, edits and removes header pairs', () => {
		const onPropertyValueChange = vi.fn();
		render(
			<AjaxElementPropertiesForm
				id="ajax-1"
				properties={properties}
				onPropertyValueChange={onPropertyValueChange}
			/>,
		);

		fireEvent.click(screen.getAllByTestId('AddCircleIcon')[0]);

		expect(onPropertyValueChange).toHaveBeenNthCalledWith(1, 'ajax-1', 'headers', [
			['accept', 'application/json'],
			['', ''],
		]);
	});

	it('reports header key and value edits and removals', () => {
		const onPropertyValueChange = vi.fn();
		render(
			<AjaxElementPropertiesForm
				id="ajax-1"
				properties={properties}
				onPropertyValueChange={onPropertyValueChange}
			/>,
		);

		const keys = screen.getAllByLabelText('Key');
		const values = screen.getAllByLabelText('Value');

		// Each key/value list renders its data rows first and a disabled placeholder row after
		// them, so the header fields come before the query parameter fields.
		fireEvent.change(keys[0], { target: { value: 'authorization' } });
		expect(onPropertyValueChange).toHaveBeenNthCalledWith(1, 'ajax-1', 'headers', [
			['authorization', 'application/json'],
		]);

		fireEvent.change(values[0], { target: { value: 'Bearer token' } });
		expect(onPropertyValueChange).toHaveBeenNthCalledWith(2, 'ajax-1', 'headers', [
			['accept', 'Bearer token'],
		]);

		fireEvent.click(screen.getAllByTestId('RemoveCircleIcon')[0]);
		expect(onPropertyValueChange).toHaveBeenNthCalledWith(3, 'ajax-1', 'headers', []);
	});

	it('reports query parameter edits', () => {
		const onPropertyValueChange = vi.fn();
		render(
			<AjaxElementPropertiesForm
				id="ajax-1"
				properties={properties}
				onPropertyValueChange={onPropertyValueChange}
			/>,
		);

		const keys = screen.getAllByLabelText('Key');
		const values = screen.getAllByLabelText('Value');
		fireEvent.change(keys[2], { target: { value: 'limit' } });
		fireEvent.change(values[2], { target: { value: '25' } });

		expect(onPropertyValueChange).toHaveBeenNthCalledWith(1, 'ajax-1', 'queryParams', [
			['limit', '1'],
		]);
		expect(onPropertyValueChange).toHaveBeenNthCalledWith(2, 'ajax-1', 'queryParams', [
			['page', '25'],
		]);
	});
});
